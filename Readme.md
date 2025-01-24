# Use n Throw splitwise?

## How to run

```bash
cd backend
pip install fastapi_cli
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
fastapi dev main.py
```

## Todo
- Group Functionalities
  - Only group creator can add members.
  - Can share an invite code to let others join.
  - People can exit themselves & be kicked out by the creator.
  - People can't leave/be removed until settled.
- Expenses
  - Handle Settlements
  - Edit Expense
  - Show all expenses you are in
  - Different ways to show who owe what  (1-1, or minimum transactions)
- Sanity
  - Rate limiter
  - Logging
  - Auto-clear table, just move to different ig