import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../../_db";
import { nanoid } from "nanoid";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { slug } = req.query;

  // Get room
  const roomResult = await db.execute({
    sql: "SELECT id, creator_participant_id FROM rooms WHERE slug = ?",
    args: [slug as string],
  });
  if (roomResult.rows.length === 0) return res.status(404).json({ error: "Room not found" });
  const room = roomResult.rows[0];

  if (req.method === "GET") {
    const result = await db.execute({
      sql: "SELECT * FROM participants WHERE room_id = ? ORDER BY created_at ASC",
      args: [room.id as string],
    });
    return res.json(result.rows);
  }

  if (req.method === "POST") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "name required" });

    const id = nanoid();
    await db.execute({
      sql: "INSERT INTO participants (id, room_id, name, is_creator) VALUES (?, ?, ?, 0)",
      args: [id, room.id as string, name],
    });

    return res.status(201).json({ id, name });
  }

  if (req.method === "DELETE") {
    // Delete by participant ID in body
    const { participantId } = req.body;
    if (!participantId) return res.status(400).json({ error: "participantId required" });

    // Don't allow deleting creator
    if (participantId === room.creator_participant_id) {
      return res.status(400).json({ error: "Cannot remove room creator" });
    }

    await db.execute({ sql: "DELETE FROM expense_splits WHERE participant_id = ?", args: [participantId] });
    await db.execute({ sql: "DELETE FROM expenses WHERE paid_by = ?", args: [participantId] });
    await db.execute({ sql: "DELETE FROM participants WHERE id = ?", args: [participantId] });

    return res.json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
