import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auctionsRouter from "./routes/auctions";
import authRouter from "./routes/auth"; // <—

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// auth
app.use("/api/auth", authRouter);

// auctions
app.use("/api/auctions", auctionsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
