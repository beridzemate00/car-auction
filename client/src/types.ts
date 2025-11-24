// client/src/types.ts

export type AuctionStatus = "live" | "upcoming" | "sold";

export interface AuctionSummary {
  id: number;
  status: AuctionStatus;
  currentBid: number;
  buyNowPrice: number | null;
  endsAt: string; // ISO date
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  location: string;
  imageUrl: string;
  damage: string;
}

export interface AuctionDetailResponse {
  car: AuctionSummary;
}

export interface User {
  id: number;
  email: string;
  name: string | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface watchlist extends AuctionSummary {}

export interface UserBid {
  id: number;
  amount: number;
  created_at: string;
  auction_id: number;
  title: string;
  make: string;
  model: string;
  year: number;
}
