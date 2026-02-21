import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "./_db.js";
import { nanoid } from "nanoid";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { name, creatorName } = req.body;
  if (!name || !creatorName) return res.status(400).json({ error: "name and creatorName required" });

  const roomId = nanoid();
  const slug = nanoid(8);
  const participantId = nanoid();

  await db.execute({
    sql: "INSERT INTO rooms (id, slug, name) VALUES (?, ?, ?)",
    args: [roomId, slug, name],
  });

  await db.execute({
    sql: "INSERT INTO participants (id, room_id, name, is_creator) VALUES (?, ?, ?, 1)",
    args: [participantId, roomId, creatorName],
  });

  await db.execute({
    sql: "UPDATE rooms SET creator_participant_id = ? WHERE id = ?",
    args: [participantId, roomId],
  });

  return res.status(201).json({ roomId, slug, participantId });
}
