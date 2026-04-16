import express from "express";
import dotenv from "dotenv";
import rateLimiterMiddleware from "./middleware/rateLimiter.js";
import transactionRoutes from "./routes/transactionRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 🔥 Logger (first)
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

// JSON parser
app.use(express.json());

// Rate limiter
app.use(rateLimiterMiddleware);

// Routes
app.use("/api/transactions", transactionRoutes);

// Home route (optional)
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});