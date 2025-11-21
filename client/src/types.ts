export type AuctionStatus = "live" | "upcoming" | "sold";

export interface AuctionSummary {
  id: number;
  status: AuctionStatus;
  currentBid: number;
  buyNowPrice: number | null;
  endsAt: string; // ISO date from backend
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
