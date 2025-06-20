const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // adjust path if needed

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET dogs owned by a specific user
router.get('/owner/:user_id/dogs', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [user_id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching dogs:', error.message);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [username, email, password, role]
    );

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, role FROM Users WHERE email = ? AND password_hash = ?`,
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
