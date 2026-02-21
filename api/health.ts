import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@libsql/client";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    const result = await db.execute("SELECT 1 as test");
    return res.json({ ok: true, dbWorks: true, result: result.rows });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      stack: err.stack?.split("\n").slice(0, 5),
    });
  }
}
