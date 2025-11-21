import { apiGet } from "./client";
import type { AuctionSummary, AuctionDetailResponse } from "../types";

export function getAuctions(): Promise<AuctionSummary[]> {
  return apiGet<AuctionSummary[]>("/auctions");
}

export function getAuctionById(id: string | number): Promise<AuctionDetailResponse> {
  return apiGet<AuctionDetailResponse>(`/auctions/${id}`);
}
