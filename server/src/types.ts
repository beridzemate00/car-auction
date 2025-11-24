// server/src/auth/types.ts

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  is_verified: boolean;
  created_at: string;
}
