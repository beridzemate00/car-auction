export type AuctionStatus = "live" | "upcoming" | "sold";
export interface User {
    id: number;
    email: string;
    password_hash: string;
    name: string | null;
    is_verified: boolean;
    created_at: string;
  }
  
  export interface JwtPayload {
    userId: number;
  }
  