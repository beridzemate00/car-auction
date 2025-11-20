import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import  auctionsRouter from "./routes/auctions";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// health-check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// auctions routes
app.use("/api/auctions", auctionsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
