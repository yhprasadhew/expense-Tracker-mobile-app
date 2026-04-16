import express from "express";
import dotenv from "dotenv";

import { sql } from "./config/db.js";
import rateLimiterMiddleware from "./middleware/rateLimiter.js";
import transactionRoutes from "./routes/transactionRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Logger
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

app.use(express.json());
app.use(rateLimiterMiddleware);

// DB check
async function testDB() {
  try {
    await sql`SELECT 1`;
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
}

testDB();

// Routes
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});