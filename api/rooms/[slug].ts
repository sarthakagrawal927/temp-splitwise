import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { slug } = req.query;

  const result = await db.execute({
    sql: "SELECT * FROM rooms WHERE slug = ?",
    args: [slug as string],
  });

  if (result.rows.length === 0) return res.status(404).json({ error: "Room not found" });

  return res.json(result.rows[0]);
}
