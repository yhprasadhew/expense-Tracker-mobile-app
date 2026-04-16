import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import rateLimiterMiddleware from "./middleware/rateLimiter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ================================
// 🔥 Middleware (ORDER MATTERS)
// ================================

// JSON parser
app.use(express.json());

// Logger (always first for debugging)
app.use((req, res, next) => {
  console.log("Request:", req.method, req.url);
  next();
});

// Rate limiter (after logger, before routes)
app.use(rateLimiterMiddleware);

// ================================
// HOME ROUTE
// ================================
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// ================================
// CREATE TRANSACTION
// ================================
app.post("/api/transactions", async (req, res) => {
  try {
    const { user_id, title, amount, category } = req.body;

    if (!user_id || !title || amount === undefined || !category) {
      return res.status(400).json({
        error: "user_id, title, amount, category are required",
      });
    }

    const result = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${user_id}, ${title}, ${amount}, ${category})
      RETURNING *;
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// SUMMARY
// ================================
app.get("/api/transactions/summary/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS income
      FROM transactions
      WHERE user_id = ${user_id} AND category = 'income';
    `;

    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM transactions
      WHERE user_id = ${user_id} AND category = 'expense';
    `;

    const income = Number(incomeResult[0].income);
    const expenses = Number(expenseResult[0].expenses);

    res.json({
      income,
      expenses,
      balance: income - expenses,
    });
  } catch (error) {
    console.error("SUMMARY ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// GET ALL TRANSACTIONS
// ================================
app.get("/api/transactions", async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM transactions
      ORDER BY created_at DESC;
    `;

    res.json(result);
  } catch (error) {
    console.error("GET ALL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// GET BY USER ID
// ================================
app.get("/api/transactions/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const result = await sql`
      SELECT * FROM transactions
      WHERE user_id = ${user_id}
      ORDER BY created_at DESC;
    `;

    res.json(result);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// DELETE TRANSACTION
// ================================
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM transactions
      WHERE id = ${id}
      RETURNING *;
    `;

    if (result.length === 0) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      message: "Deleted successfully",
      deleted: result[0],
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//s