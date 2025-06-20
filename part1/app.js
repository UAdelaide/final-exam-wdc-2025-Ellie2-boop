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
app.get('/api/owner/:user_id/dogs', (req, res) => {
  const userId = req.params.user_id;

  // Hardcoded sample data for testing only
  const sampleDogs = {
    7: [{ dog_id: 2, name: 'Max' }, { dog_id: 5, name: 'Daisy' }],
    9: [{ dog_id: 3, name: 'Bella' }, { dog_id: 6, name: 'Rocky' }],
  };

  res.json(sampleDogs[userId] || []);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
