import express from "express";
import {
  getTransactionsByUserId,
  createTransaction,
  deleteTransaction,
  getSummary,
  getAllTransactions
} from "../controllers/transactionController.js";

const router = express.Router();

// CREATE
router.post("/", createTransaction);

// SUMMARY
router.get("/summary/:user_id", getSummary);

// GET ALL
router.get("/", getAllTransactions);

// GET BY USER
router.get("/:user_id", getTransactionsByUserId);

// DELETE
router.delete("/:id", deleteTransaction);

export default router;