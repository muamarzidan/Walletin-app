import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import errorHandler, { notFoundHandler } from "./middleware/errorHandler.js";

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

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API routes
app.use("/api/transactions", transactionsRoute);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
initDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server is up and running on PORT:", PORT);
    console.log("Access from network: http://192.168.18.15:" + PORT);
    console.log("Environment:", process.env.NODE_ENV || "development");
  });
});
