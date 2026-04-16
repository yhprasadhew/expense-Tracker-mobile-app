import { sql } from "../config/db.js";

// CREATE
export async function createTransaction(req, res) {
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
}

// GET ALL
export async function getAllTransactions(req, res) {
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
}

// GET BY USER ID
export async function getTransactionsByUserId(req, res) {
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
}

// DELETE
export async function deleteTransaction(req, res) {
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
}

// SUMMARY
export async function getSummary(req, res) {
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
}