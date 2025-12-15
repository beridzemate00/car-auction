// client/src/api/auth.ts
import { apiPost, apiGet, apiDelete } from "./client";
import type { AuthResponse, User } from "../types";

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

export function resendCode(email: string) {
  return apiPost<{ message: string }>("/auth/resend-code", { email });
}

export function checkCode(email: string, code: string) {
  return apiPost<{ message: string; valid: boolean }>("/auth/check-code", { email, code });
}

// Get current user from session token
export function getMe() {
  return apiGet<{ user: User }>("/auth/me");
}

// Logout current session
export function logout() {
  return apiPost<{ message: string }>("/auth/logout", {});
}

// Clear all sessions (logout everywhere)
export function clearAllSessions() {
  return apiDelete<{ message: string; sessionsCleared: number }>("/auth/sessions");
}

