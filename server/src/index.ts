import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import auctionsRouter from "./routes/auctions";
import authRouter from "./routes/auth";
import userDashboardRouter from "./routes/userDashboard";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/auctions", auctionsRouter);
app.use("/api/user", userDashboardRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
