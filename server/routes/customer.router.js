const express = require('express');
const pool = require('../modules/pool');
const {rejectUnauthenticated,rejectIfNotAdmin} = require ("../modules/authentication-middleware");



const router = express.Router();


router.get('/', rejectUnauthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id DESC;');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting customers:', err.message);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});
router.get("/search", rejectUnauthenticated, async (req, res) => {
  const { query } = req.query;

  try {
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Search query is required" });
    }

    const searchTerm = `%${query}%`;

    const sqlText = `
      SELECT * FROM customers
      WHERE firstname ILIKE $1
         OR lastname ILIKE $1
         OR phone ILIKE $1
      ORDER BY firstname ASC;
    `;

    const result = await pool.query(sqlText, [searchTerm]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error searching customers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/:id', rejectUnauthenticated, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1;', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting customer:', err.message);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

router.post('/', rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  const { firstname, lastname, phone, notes } = req.body;

  if (!firstname || !lastname) {
    return res.status(400).json({ error: 'Firstname and lastname are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (firstname, lastname, phone, notes, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *;`,
      [firstname, lastname, phone, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding customer:', err.message);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

router.put('/:id', rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  const { firstname, lastname, phone, notes } = req.body;

  if (!firstname || !lastname) {
    return res.status(400).json({ error: 'Firstname and lastname are required' });
  }

  try {
    const result = await pool.query(
      `UPDATE customers
       SET firstname = $1, lastname = $2, phone = $3, notes = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *;`,
      [firstname, lastname, phone, notes, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

router.delete('/:id', rejectUnauthenticated, rejectIfNotAdmin, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customers WHERE id = $1;', [req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.sendStatus(204);
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});



module.exports = router;
