const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");
const { rejectUnauthenticated, rejectIfNotAdmin } = require("../modules/authentication-middleware");

router.get("/", rejectUnauthenticated, async (req, res) => {
  try {
    const queryText = `
      SELECT t.*, c.firstname, c.lastname 
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      ORDER BY t.created_at DESC;
    `;
    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/search", rejectUnauthenticated, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === "") {
      const result = await pool.query(`
        SELECT t.*, c.firstname, c.lastname 
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id
        ORDER BY t.created_at DESC;
      `);
      return res.json(result.rows);
    }
    const queryText = `
      SELECT t.*, c.firstname, c.lastname 
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      WHERE 
        LOWER(c.firstname) LIKE LOWER($1) OR
        LOWER(c.lastname) LIKE LOWER($1) OR
        LOWER(t.transaction_type) LIKE LOWER($1)
      ORDER BY t.created_at DESC;
    `;
    const searchTerm = `%${q}%`;
    const result = await pool.query(queryText, [searchTerm]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error searching transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/customer/:customerId", rejectUnauthenticated, async (req, res) => {
  try {
    const { customerId } = req.params;
    const queryText = `
      SELECT t.*, c.firstname, c.lastname 
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      WHERE t.customer_id = $1
      ORDER BY t.created_at DESC;
    `;
    const result = await pool.query(queryText, [customerId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", rejectUnauthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.firstname, c.lastname 
       FROM transactions t
       JOIN customers c ON t.customer_id = c.id
       WHERE t.id = $1;`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", rejectUnauthenticated, async (req, res) => {
  try {
    const { customer_id, transaction_type, amount } = req.body;

    if (!customer_id || !transaction_type || !amount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!["credit", "debit"].includes(transaction_type.toLowerCase())) {
      return res.status(400).json({ error: "Transaction type must be 'credit' or 'debit'" });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const balanceQuery = `
      SELECT balance_after FROM transactions 
      WHERE customer_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1;
    `;
    const balanceResult = await pool.query(balanceQuery, [customer_id]);
    const lastBalance = balanceResult.rows.length ? parseFloat(balanceResult.rows[0].balance_after) : 0;

    let newBalance = lastBalance;
    if (transaction_type.toLowerCase() === "credit") {
      newBalance += parseFloat(amount);
    }
    if (transaction_type.toLowerCase() === "debit") {
      newBalance -= parseFloat(amount);
    }

    const queryText = `
      INSERT INTO transactions (customer_id, transaction_type, amount, balance_after)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(queryText, [customer_id, transaction_type.toLowerCase(), parseFloat(amount), newBalance]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.put("/:id", rejectUnauthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_type, amount } = req.body;

    if (!transaction_type || !amount) {
      return res.status(400).json({ error: "Transaction type and amount are required" });
    }

    if (!["credit", "debit"].includes(transaction_type.toLowerCase())) {
      return res.status(400).json({ error: "Transaction type must be 'credit' or 'debit'" });
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Amount must be a positive number" });
    }

    const result = await pool.query(
      `UPDATE transactions
       SET transaction_type = $1,
           amount = $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *;`,
      [transaction_type.toLowerCase(), parseFloat(amount), id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.delete("/:id", rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM transactions WHERE id = $1 RETURNING *;`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

module.exports = router;