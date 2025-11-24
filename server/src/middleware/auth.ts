// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { pool } from "../db";

export interface AuthRequest extends Request {
  userId?: number;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.slice("Bearer ".length);

  try {
    const result = await pool.query(
      `SELECT user_id, expires_at FROM sessions WHERE token = $1`,
      [token]
    );

    if (!result.rowCount) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const row = result.rows[0] as { user_id: number; expires_at: string };

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.userId = row.user_id;
    next();
  } catch (err) {
    console.error("Auth middleware error", err);
    return res.status(500).json({ message: "Auth failed" });
  }
}
