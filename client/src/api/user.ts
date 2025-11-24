// client/src/api/user.ts
import { apiGet, apiPost, apiDelete } from "./client";
import type { WatchlistItem, UserBid } from "../types";

export function getWatchlist() {
  return apiGet<WatchlistItem[]>("/user/watchlist");
}

export function addToWatchlist(auctionId: number) {
  return apiPost<{ message: string }>(`/user/watchlist/${auctionId}`, {});
}

export function removeFromWatchlist(auctionId: number) {
  return apiDelete<{ message: string }>(`/user/watchlist/${auctionId}`);
}

export function getUserBids() {
  return apiGet<UserBid[]>("/user/bids");
}
