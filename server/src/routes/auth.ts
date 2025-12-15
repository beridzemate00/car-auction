// server/src/routes/auth.ts

import express from "express";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { pool } from "../db";
import { sendVerificationEmail } from "../auth/mail";
import type { User } from "../types";

const router = express.Router();

const VERIFICATION_CODE_TTL_MINUTES = 60; // increased from 15 to 60 minutes for testing
const SALT_ROUNDS = 10;
const SESSION_TTL_DAYS = 7;

// helper: 6-digit code like "123456"
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// helper: create a session token and store in DB
async function createSessionForUser(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(
    Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  await pool.query(
    `
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `,
    [userId, token, expiresAt]
  );

  return token;
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

    const existing = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    let userId: number;

    if (existing.rowCount && existing.rows[0].is_verified) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    if (existing.rowCount) {
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
    try {
      await pool.query("UPDATE users SET is_verified = true WHERE id = $1", [
        user.id,
      ]);

      await pool.query(
        "UPDATE email_verification_codes SET used = true WHERE id = $1",
        [verification.id]
      );

      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }

    const token = await createSessionForUser(user.id);

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

    const token = await createSessionForUser(user.id);

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

// POST /api/auth/resend-code - Resend verification code
router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
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

    if (user.is_verified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Invalidate old codes
    await pool.query(
      "UPDATE email_verification_codes SET used = true WHERE user_id = $1 AND used = false",
      [user.id]
    );

    // Generate new code
    const code = generateVerificationCode();
    const expiresAt = new Date(
      Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60_000
    ).toISOString();

    await pool.query(
      `
        INSERT INTO email_verification_codes (user_id, code, expires_at)
        VALUES ($1, $2, $3)
      `,
      [user.id, code, expiresAt]
    );

    await sendVerificationEmail(normalizedEmail, code);

    return res.status(200).json({ message: "Verification code sent to email" });
  } catch (err) {
    console.error("POST /api/auth/resend-code error", err);
    return res.status(500).json({ message: "Failed to resend code" });
  }
});

// POST /api/auth/check-code - Check if verification code is valid (without verifying)
router.post("/check-code", async (req, res) => {
  try {
    const { email, code } = req.body as {
      email?: string;
      code?: string;
    };

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: "Code must be 6 digits" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await pool.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (!userRes.rowCount) {
      return res.status(400).json({ message: "User not found", valid: false });
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
      return res.status(400).json({ message: "Invalid code", valid: false });
    }

    const verification = codeRes.rows[0] as {
      id: number;
      expires_at: string;
      used: boolean;
    };

    if (new Date(verification.expires_at).getTime() < Date.now()) {
      return res.status(400).json({ message: "Code has expired", valid: false });
    }

    return res.status(200).json({ message: "Code is valid", valid: true });
  } catch (err) {
    console.error("POST /api/auth/check-code error", err);
    return res.status(500).json({ message: "Failed to check code", valid: false });
  }
});

// GET /api/auth/me - Get current user from session token
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice("Bearer ".length);

    const sessionRes = await pool.query(
      `SELECT user_id, expires_at FROM sessions WHERE token = $1`,
      [token]
    );

    if (!sessionRes.rowCount) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const session = sessionRes.rows[0] as { user_id: number; expires_at: string };

    if (new Date(session.expires_at).getTime() < Date.now()) {
      // Clean up expired session
      await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
      return res.status(401).json({ message: "Session expired" });
    }

    const userRes = await pool.query<User>(
      "SELECT id, email, name, is_verified, created_at FROM users WHERE id = $1",
      [session.user_id]
    );

    if (!userRes.rowCount) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = userRes.rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.is_verified,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    console.error("GET /api/auth/me error", err);
    return res.status(500).json({ message: "Failed to get user" });
  }
});

// POST /api/auth/logout - Invalidate the current session
router.post("/logout", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(200).json({ message: "Logged out" });
    }

    const token = header.slice("Bearer ".length);

    await pool.query("DELETE FROM sessions WHERE token = $1", [token]);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("POST /api/auth/logout error", err);
    return res.status(500).json({ message: "Logout failed" });
  }
});

// DELETE /api/auth/sessions - Clear all sessions for current user (logout everywhere)
router.delete("/sessions", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = header.slice("Bearer ".length);

    const sessionRes = await pool.query(
      `SELECT user_id FROM sessions WHERE token = $1`,
      [token]
    );

    if (!sessionRes.rowCount) {
      return res.status(401).json({ message: "Invalid session" });
    }

    const userId = (sessionRes.rows[0] as { user_id: number }).user_id;

    const deleteRes = await pool.query(
      "DELETE FROM sessions WHERE user_id = $1",
      [userId]
    );

    return res.status(200).json({
      message: "All sessions cleared",
      sessionsCleared: deleteRes.rowCount,
    });
  } catch (err) {
    console.error("DELETE /api/auth/sessions error", err);
    return res.status(500).json({ message: "Failed to clear sessions" });
  }
});

export default router;
