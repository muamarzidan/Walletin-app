import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";


dotenv.config();
const app = express();

if (process.env.NODE_ENV === "production") job.start();

// middleware
app.use(cors());
app.use(rateLimiter);
app.use(express.json());


const PORT = process.env.PORT || 5001;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/transactions", transactionsRoute);

initDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is up and running on PORT:", PORT);
    console.log("Access from network: http://10.44.233.148:" + PORT);
  });
});
