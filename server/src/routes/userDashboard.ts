// server/src/routes/userDashboard.ts
import express from "express";
import { pool } from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = express.Router();

// GET /api/user/watchlist
router.get("/watchlist", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
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
        FROM watchlist w
        JOIN auctions a ON a.id = w.auction_id
        JOIN cars c ON c.id = a.car_id
        WHERE w.user_id = $1
        ORDER BY a.ends_at ASC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/user/watchlist error", err);
    res.status(500).json({ message: "Failed to load watchlist" });
  }
});

// POST /api/user/watchlist/:auctionId
router.post("/watchlist/:auctionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const auctionId = Number(req.params.auctionId);

    await pool.query(
      `
        INSERT INTO watchlist (user_id, auction_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, auction_id) DO NOTHING
      `,
      [userId, auctionId]
    );

    res.status(201).json({ message: "Added to watchlist" });
  } catch (err) {
    console.error("POST /api/user/watchlist/:auctionId error", err);
    res.status(500).json({ message: "Failed to update watchlist" });
  }
});

// DELETE /api/user/watchlist/:auctionId
router.delete(
  "/watchlist/:auctionId",
  requireAuth,
  async (req: AuthRequest, res) => {
    try {
      const userId = req.userId!;
      const auctionId = Number(req.params.auctionId);

      await pool.query(
        `DELETE FROM watchlist WHERE user_id = $1 AND auction_id = $2`,
        [userId, auctionId]
      );

      res.status(200).json({ message: "Removed from watchlist" });
    } catch (err) {
      console.error("DELETE /api/user/watchlist/:auctionId error", err);
      res.status(500).json({ message: "Failed to update watchlist" });
    }
  }
);

// GET /api/user/bids (bidding history)
router.get("/bids", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const result = await pool.query(
      `
        SELECT
          b.id,
          b.amount,
          b.created_at,
          a.id AS auction_id,
          c.title,
          c.make,
          c.model,
          c.year
        FROM bids b
        JOIN auctions a ON a.id = b.auction_id
        JOIN cars c ON c.id = a.car_id
        WHERE b.bidder_name = $1
        ORDER BY b.created_at DESC
        LIMIT 100
      `,
      [String(userId)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/user/bids error", err);
    res.status(500).json({ message: "Failed to load bids" });
  }
});

export default router;
