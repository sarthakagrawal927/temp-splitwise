import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../../_db.js";
import { nanoid } from "nanoid";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  const roomResult = await db.execute({
    sql: "SELECT id FROM rooms WHERE slug = ?",
    args: [slug as string],
  });
  if (roomResult.rows.length === 0) return res.status(404).json({ error: "Room not found" });
  const roomId = roomResult.rows[0].id as string;

  if (req.method === "GET") {
    const expenses = await db.execute({
      sql: "SELECT * FROM expenses WHERE room_id = ? ORDER BY created_at DESC",
      args: [roomId],
    });

    const splits = await db.execute({
      sql: `SELECT es.* FROM expense_splits es
            JOIN expenses e ON es.expense_id = e.id
            WHERE e.room_id = ?`,
      args: [roomId],
    });

    return res.json({ expenses: expenses.rows, splits: splits.rows });
  }

  if (req.method === "POST") {
    const { description, amount, paidBy, splitType, customSplits } = req.body;
    if (!description || !amount || !paidBy) {
      return res.status(400).json({ error: "description, amount, paidBy required" });
    }

    const expenseId = nanoid();

    await db.execute({
      sql: "INSERT INTO expenses (id, room_id, description, amount, paid_by, split_type) VALUES (?, ?, ?, ?, ?, ?)",
      args: [expenseId, roomId, description, amount, paidBy, splitType || "equal"],
    });

    if (splitType === "custom" && customSplits) {
      for (const split of customSplits) {
        await db.execute({
          sql: "INSERT INTO expense_splits (id, expense_id, participant_id, owed_amount) VALUES (?, ?, ?, ?)",
          args: [nanoid(), expenseId, split.participantId, split.amount],
        });
      }
    } else {
      // Equal split among all participants
      const participants = await db.execute({
        sql: "SELECT id FROM participants WHERE room_id = ?",
        args: [roomId],
      });
      const perPerson = amount / participants.rows.length;
      for (const p of participants.rows) {
        await db.execute({
          sql: "INSERT INTO expense_splits (id, expense_id, participant_id, owed_amount) VALUES (?, ?, ?, ?)",
          args: [nanoid(), expenseId, p.id as string, perPerson],
        });
      }
    }

    return res.status(201).json({ id: expenseId });
  }

  if (req.method === "DELETE") {
    const { expenseId } = req.body;
    if (!expenseId) return res.status(400).json({ error: "expenseId required" });

    await db.execute({ sql: "DELETE FROM expense_splits WHERE expense_id = ?", args: [expenseId] });
    await db.execute({ sql: "DELETE FROM expenses WHERE id = ?", args: [expenseId] });

    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
