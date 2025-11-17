const express = require("express");
const router = express.Router();
const pool = require("../modules/pool");
const { rejectUnauthenticated } = require("../modules/authentication-middleware");

router.get("/", rejectUnauthenticated, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "";
    let dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = "WHERE DATE(created_at) BETWEEN $1 AND $2";
      dateParams = [startDate, endDate];
    }

    const totalCustomersResult = await pool.query(
      "SELECT COUNT(*) as count FROM customers;"
    );
    const totalCustomers = parseInt(totalCustomersResult.rows[0].count);

    const balanceQuery = `
      SELECT 
        SUM(CASE WHEN balance_after > 0 THEN balance_after ELSE 0 END) as total_paid,
        SUM(CASE WHEN balance_after < 0 THEN ABS(balance_after) ELSE 0 END) as total_owed
      FROM (
        SELECT DISTINCT ON (customer_id) customer_id, balance_after
        FROM transactions
        ${dateFilter}
        ORDER BY customer_id, created_at DESC
      ) latest_balances;
    `;

    const balanceResult = await pool.query(balanceQuery, dateParams);
    const totalPaid = parseFloat(balanceResult.rows[0].total_paid) || 0;
    const totalOwed = parseFloat(balanceResult.rows[0].total_owed) || 0;

    const transactionCountQuery = `
      SELECT COUNT(*) as count FROM transactions ${dateFilter};
    `;
    const transactionCountResult = await pool.query(transactionCountQuery, dateParams);
    const totalTransactions = parseInt(transactionCountResult.rows[0].count);

    const creditDebitQuery = `
      SELECT 
        transaction_type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions
      ${dateFilter}
      GROUP BY transaction_type;
    `;
    const creditDebitResult = await pool.query(creditDebitQuery, dateParams);

    let creditCount = 0;
    let debitCount = 0;

    creditDebitResult.rows.forEach((row) => {
      if (row.transaction_type === "credit") {
        creditCount = parseInt(row.count);
      } else if (row.transaction_type === "debit") {
        debitCount = parseInt(row.count);
      }
    });

    const averageTransactionQuery = `
      SELECT AVG(amount) as avg FROM transactions ${dateFilter};
    `;
    const averageTransactionResult = await pool.query(averageTransactionQuery, dateParams);
    const averageTransaction = parseFloat(averageTransactionResult.rows[0].avg) || 0;

    const customersBalanceQuery = `
      SELECT 
        SUM(CASE WHEN balance_after > 0 THEN 1 ELSE 0 END) as with_balance,
        SUM(CASE WHEN balance_after < 0 THEN 1 ELSE 0 END) as with_debt
      FROM (
        SELECT DISTINCT ON (customer_id) customer_id, balance_after
        FROM transactions
        ${dateFilter}
        ORDER BY customer_id, created_at DESC
      ) latest_balances;
    `;
    const customersBalanceResult = await pool.query(customersBalanceQuery, dateParams);

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