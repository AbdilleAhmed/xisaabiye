const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");
const { rejectUnauthenticated } = require("../modules/authentication-middleware");

router.get("/", rejectUnauthenticated, async (req, res) => {
  try {
    const totalCustomersResult = await pool.query(
      "SELECT COUNT(*) as count FROM customers;"
    );
    const totalCustomers = parseInt(totalCustomersResult.rows[0].count);

    const balanceResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN balance_after > 0 THEN balance_after ELSE 0 END) as total_paid,
        SUM(CASE WHEN balance_after < 0 THEN ABS(balance_after) ELSE 0 END) as total_owed
      FROM (
        SELECT DISTINCT ON (customer_id) customer_id, balance_after
        FROM transactions
        ORDER BY customer_id, created_at DESC
      ) latest_balances;
    `);

    const totalPaid = parseFloat(balanceResult.rows[0].total_paid) || 0;
    const totalOwed = parseFloat(balanceResult.rows[0].total_owed) || 0;

    const transactionCountResult = await pool.query(
      "SELECT COUNT(*) as count FROM transactions;"
    );
    const totalTransactions = parseInt(transactionCountResult.rows[0].count);

    const creditDebitResult = await pool.query(`
      SELECT 
        transaction_type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions
      GROUP BY transaction_type;
    `);

    let creditCount = 0;
    let debitCount = 0;

    creditDebitResult.rows.forEach((row) => {
      if (row.transaction_type === "credit") {
        creditCount = parseInt(row.count);
      } else if (row.transaction_type === "debit") {
        debitCount = parseInt(row.count);
      }
    });

    const averageTransactionResult = await pool.query(
      "SELECT AVG(amount) as avg FROM transactions;"
    );
    const averageTransaction = parseFloat(averageTransactionResult.rows[0].avg) || 0;

    const customersBalanceResult = await pool.query(`
      SELECT 
        SUM(CASE WHEN balance_after > 0 THEN 1 ELSE 0 END) as with_balance,
        SUM(CASE WHEN balance_after < 0 THEN 1 ELSE 0 END) as with_debt
      FROM (
        SELECT DISTINCT ON (customer_id) customer_id, balance_after
        FROM transactions
        ORDER BY customer_id, created_at DESC
      ) latest_balances;
    `);

    const customersWithBalance = parseInt(customersBalanceResult.rows[0].with_balance) || 0;
    const customersWithDebt = parseInt(customersBalanceResult.rows[0].with_debt) || 0;

    res.json({
      totalCustomers,
      totalPaid,
      totalOwed,
      totalTransactions,
      creditCount,
      debitCount,
      averageTransaction,
      customersWithBalance,
      customersWithDebt,
    });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;