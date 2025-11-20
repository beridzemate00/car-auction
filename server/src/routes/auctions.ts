import express from "express";
import { pool } from "../db";
import type { AuctionStatus } from "../types";

const router = express.Router();

// GET /api/auctions
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.current_bid,
        a.buy_now_price,
        a.ends_at,
        c.title,
        c.make,
        c.model,
        c.year,
        c.mileage,
        c.location,
        c.image_url,
        c.damage
      FROM auctions a
      JOIN cars c ON c.id = a.car_id
      ORDER BY a.ends_at ASC;
      `
    );

    const data = result.rows.map((row) => ({
      id: row.id,
      status: row.status as AuctionStatus,
      currentBid: Number(row.current_bid),
      buyNowPrice: row.buy_now_price ? Number(row.buy_now_price) : null,
      endsAt: row.ends_at,
      title: row.title,
      make: row.make,
      model: row.model,
      year: row.year,
      mileage: row.mileage,
      location: row.location,
      imageUrl: row.image_url,
      damage: row.damage,
    }));

    res.json(data);
  } catch (err) {
    console.error("GET /api/auctions error", err);
    res.status(500).json({ message: "Failed to fetch auctions" });
  }
});

// GET /api/auctions/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const auctionRes = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.current_bid,
        a.buy_now_price,
        a.ends_at,
        c.title,
        c.make,
        c.model,
        c.year,
        c.mileage,
        c.location,
        c.image_url,
        c.damage
      FROM auctions a
      JOIN cars c ON c.id = a.car_id
      WHERE a.id = $1
      `,
      [id]
    );

    if (auctionRes.rowCount === 0) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const row = auctionRes.rows[0];

    const car = {
      id: row.id,
      status: row.status as AuctionStatus,
      currentBid: Number(row.current_bid),
      buyNowPrice: row.buy_now_price ? Number(row.buy_now_price) : null,
      endsAt: row.ends_at,
      title: row.title,
      make: row.make,
      model: row.model,
      year: row.year,
      mileage: row.mileage,
      location: row.location,
      imageUrl: row.image_url,
      damage: row.damage,
    };

    res.json({ car });
  } catch (err) {
    console.error("GET /api/auctions/:id error", err);
    res.status(500).json({ message: "Failed to fetch auction detail" });
  }
});

export default router;
