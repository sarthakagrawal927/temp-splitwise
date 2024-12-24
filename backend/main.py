from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from models import User, Group, GroupMember, Expense, ExpenseSplit, DatabaseSchemaBase
from contextlib import asynccontextmanager

# Database Configuration
DATABASE_URL = "postgresql+asyncpg://postgres:1234567890@localhost:5432/splitwise"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


# Schemas
class UserCreate(BaseModel):
    name: str


class GroupCreate(BaseModel):
    name: str
    user_ids: list[int]


class ExpenseCreate(BaseModel):
    group_id: int
    amount: float
    description: str
    split_type: str  # "equal" or "percentage"
    splits: list[dict] | None = None  # For "percentage", provide user_id and percentage
    paid_by: int


@asynccontextmanager
async def lifespan(app: FastAPI):  # Load the ML model
    async with engine.begin() as conn:
        await conn.run_sync(DatabaseSchemaBase.metadata.create_all)
    yield


# FastAPI App
app = FastAPI(lifespan=lifespan)


@app.post("/users/")
async def create_user(user: UserCreate):
    async with SessionLocal() as session:
        new_user = User(name=user.name)
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return {"id": new_user.id, "name": new_user.name}


@app.post("/groups/")
async def create_group(group: GroupCreate):
    async with SessionLocal() as session:
        new_group = Group(name=group.name)
        session.add(new_group)
        await session.commit()
        group_members = [
            GroupMember(group_id=new_group.id, user_id=user_id)
            for user_id in group.user_ids
        ]
        session.add_all(group_members)
        await session.commit()
        return {"id": new_group.id, "name": new_group.name}


@app.post("/expenses/")
async def add_expense(expense: ExpenseCreate):
    async with SessionLocal() as session:
        new_expense = Expense(
            group_id=expense.group_id,
            amount=expense.amount,
            description=expense.description,
        )
        session.add(new_expense)
        await session.commit()
        await session.refresh(new_expense)

        if expense.split_type == "equal":
            group_members = await session.execute(
                text(
                    f"SELECT user_id FROM group_members WHERE group_id = {expense.group_id}"
                )
            )
            members = group_members.fetchall()
            split_amount = expense.amount / len(members)
            splits = [
                ExpenseSplit(
                    expense_id=new_expense.id,
                    user_id=member.user_id,
                    amount=-split_amount,
                    group_id=expense.group_id,
                )
                for member in members
            ]
        elif expense.split_type == "percentage":
            splits = [
                ExpenseSplit(
                    expense_id=new_expense.id,
                    user_id=split["user_id"],
                    amount=-expense.amount * split["percentage"] / 100,
                    group_id=expense.group_id,
                )
                for split in expense.splits
            ]
        else:
            raise HTTPException(status_code=400, detail="Invalid split type")

        splits.append(
            ExpenseSplit(
                expense_id=new_expense.id,
                user_id=expense.paid_by,
                amount=expense.amount,
                group_id=expense.group_id,
            )
        )

        session.add_all(splits)
        await session.commit()
        return {"id": new_expense.id, "description": new_expense.description}


@app.get("/groups/{group_id}/balances/")
async def get_balances(group_id: int):
    async with SessionLocal() as session:
        group_expenses = await session.execute(
            text(
                "SELECT gm.user_id, COALESCE(SUM(amount), 0) as balance FROM group_members gm "
                "LEFT JOIN expense_splits es ON gm.user_id = es.user_id "
                "WHERE gm.group_id =:group_id GROUP BY gm.user_id"
            ),
            {"group_id": group_id},
        )
        balances = group_expenses.fetchall()
        print(balances, group_id)
        return [
            {"user_id": balance.user_id, "balance": balance.balance}
            for balance in balances
        ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
