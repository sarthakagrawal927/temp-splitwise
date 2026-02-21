import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      creator_participant_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      is_creator INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      paid_by TEXT NOT NULL REFERENCES participants(id),
      split_type TEXT NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'custom')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expense_splits (
      id TEXT PRIMARY KEY,
      expense_id TEXT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
      participant_id TEXT NOT NULL REFERENCES participants(id),
      owed_amount REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);
    CREATE INDEX IF NOT EXISTS idx_participants_room ON participants(room_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_room ON expenses(room_id);
    CREATE INDEX IF NOT EXISTS idx_splits_expense ON expense_splits(expense_id);
  `);

  return res.status(200).json({ ok: true });
}
