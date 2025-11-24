// client/src/api/auth.ts
import { apiPost } from "./client";
import type { AuthResponse } from "../types";

export function register(email: string, password: string, name?: string) {
  return apiPost<{ message: string }>("/auth/register", {
    email,
    password,
    name,
  });
}

export function verifyEmail(email: string, code: string) {
  return apiPost<AuthResponse>("/auth/verify", { email, code });
}

export function login(email: string, password: string) {
  return apiPost<AuthResponse>("/auth/login", { email, password });
}
