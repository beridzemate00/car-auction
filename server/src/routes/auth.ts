import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { sendVerificationEmail } from "../auth/mail";
import type { User, JwtPayload } from "../auth/types";

const router = express.Router();

const VERIFICATION_CODE_TTL_MINUTES = 15;
const SALT_ROUNDS = 10;

// 6-значный код
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// подпись JWTcd 
function signToken(userId: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  const payload: JwtPayload = { userId };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // ищем пользователя
    const existing = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    let userId: number;

    if (existing.rowCount && existing.rows[0].is_verified) {
      // уже есть верифицированный пользователь
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (existing.rowCount) {
      // есть не верифицированный пользователь — обновляем
      const updated = await pool.query<User>(
        `
        UPDATE users
        SET password_hash = $1, name = $2
        WHERE id = $3
        RETURNING id
      `,
        [passwordHash, name ?? null, existing.rows[0].id]
      );
      userId = updated.rows[0].id;
    } else {
      // создаём нового
      const inserted = await pool.query<User>(
        `
        INSERT INTO users (email, password_hash, name)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
        [normalizedEmail, passwordHash, name ?? null]
      );
      userId = inserted.rows[0].id;
    }

    // создаём код
    const code = generateVerificationCode();
    const expiresAt = new Date(
      Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000
    ).toISOString();

    await pool.query(
      `
      INSERT INTO email_verification_codes (user_id, code, expires_at)
      VALUES ($1, $2, $3)
    `,
      [userId, code, expiresAt]
    );

    // отправляем письмо
    await sendVerificationEmail(normalizedEmail, code);

    return res
      .status(200)
      .json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error("POST /api/auth/register error", err);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// POST /api/auth/verify
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (!userRes.rowCount) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = userRes.rows[0];

    const codeRes = await pool.query(
      `
      SELECT id, code, expires_at, used
      FROM email_verification_codes
      WHERE user_id = $1
        AND code = $2
        AND used = false
      ORDER BY created_at DESC
      LIMIT 1
    `,
      [user.id, code]
    );

    if (!codeRes.rowCount) {
      return res.status(400).json({ message: "Invalid code" });
    }

    const verification = codeRes.rows[0] as {
      id: number;
      expires_at: string;
      used: boolean;
    };

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: "Code has expired" });
    }

    await pool.query("BEGIN");

    await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
      user.id,
    ]);

    await pool.query(
      "UPDATE email_verification_codes SET used = true WHERE id = $1",
      [verification.id]
    );

    await pool.query("COMMIT");

    const token = signToken(user.id);

    return res.status(200).json({
      message: "Email verified",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("POST /api/auth/verify error", err);
    try {
      await pool.query("ROLLBACK");
    } catch {
      // ignore
    }
    return res.status(500).json({ message: "Verification failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (!userRes.rowCount) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userRes.rows[0];

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.is_verified) {
      return res.status(403).json({ message: "Email is not verified" });
    }

    const token = signToken(user.id);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("POST /api/auth/login error", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

export default router;
