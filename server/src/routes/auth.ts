// server/src/routes/auth.ts
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { sendVerificationEmail } from "../auth/mail";
import type { User } from "../auth/types";

const router = express.Router();

const VERIFICATION_CODE_TTL_MINUTES = 15;
const SALT_ROUNDS = 10;

// 6-значный код
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// подпись JWT – ОДНА нормальная функция
function signToken(userId: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }

  // обычный объект, без типов JwtPayload
  const payload = { userId };

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}
