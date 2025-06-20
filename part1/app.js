const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('DogWalkService API is running');
});

// Get all dogs with their owner usernames
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dogs:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get dogs by owner id
app.get('/api/owner/:user_id/dogs', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT dog_id, name FROM Dogs WHERE owner_id = ?`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dogs by owner:', err.message);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
