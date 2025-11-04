const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");
const { rejectUnauthenticated, rejectIfNotAdmin } = require("../modules/authentication-middleware");


// get all transactions (only for admin)
// rejectUnauthenticated, rejectIfNotAdmin middlewares used
router.get("/", rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  try {
    const queryText = `
      SELECT t.*, c.firstname, c.lastname, u.username
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC;
    `;

    const result = await pool.query(queryText);
    res.json(result.rows);
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({ error: "internal serveer error" });
  }
});

// summary route

router.get("/summary", rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM customers) AS total_customers,
        (SELECT COUNT(*) FROM transactions) AS total_transactions,
        COALESCE(SUM(t.amount_paid), 0) AS total_paid,
        COALESCE(SUM(t.balance_after), 0) AS total_debt
      FROM transactions t;
    `;
    const result = await pool.query(query);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// get all transactions 
router.get("/customer/:id", rejectUnauthenticated, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM transactions WHERE customer_id = $1 ORDER BY created_at DESC;`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching customer transactions:", error);
    res.status(500).json({ error: "not found" });
  }
});

// post new transactions route
router.post('/', rejectUnauthenticated, async (req, res) => {
  try {
    const { customer_id, transaction_type, total_amount, amount_paid } = req.body;
    const user_id = req.user.id;

    const lastBalanceQuery = `
      SELECT balance_after 
      FROM transactions 
      WHERE customer_id = $1 
      ORDER BY id DESC 
      LIMIT 1;
    `;
    const lastBalanceResult = await pool.query(lastBalanceQuery, [customer_id]);

    const previous_balance = lastBalanceResult.rows.length > 0 
      ? parseFloat(lastBalanceResult.rows[0].balance_after)
      : 0;

    let new_balance;

    if (transaction_type === 'credit') {
      new_balance = previous_balance + (parseFloat(total_amount) - parseFloat(amount_paid));
    } else if (transaction_type === 'debit') {
      new_balance = previous_balance - (parseFloat(total_amount) - parseFloat(amount_paid));
    } else {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }

    const insertQuery = `
      INSERT INTO transactions 
      (user_id, customer_id, transaction_type, total_amount, amount_paid)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [
      user_id,
      customer_id,
      transaction_type,
      total_amount,
      amount_paid
    ]);

    res.status(201).json({
      ...result.rows[0],
      computed_balance_after: new_balance
    });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// update treansactions route

router.put("/:id", rejectUnauthenticated, async (req, res) => {
  const { id } = req.params;
  const { transaction_type, total_amount, amount_paid } = req.body;

  try {
    const result = await pool.query(
      `UPDATE transactions
       SET transaction_type = $1,
           total_amount = $2::numeric,
           amount_paid = $3::numeric,
           balance_after = ($2::numeric - $3::numeric),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *;`,
      [transaction_type, total_amount, amount_paid, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Transaction not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// delete route (only for admin)

router.delete("/:id", rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  try {
    await pool.query("DELETE FROM transactions WHERE id = $1;", [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// get summary route (for admins only)



module.exports = router;
