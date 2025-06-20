const express = require('express');
const path = require('path');
const pool = require('./models/db');// Adjust path if needed


const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

app.get('/api/owner/:user_id/dogs', async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT dog_id, name FROM Dogs WHERE owner_id = ?',
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching dogs:', err.message);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});




// Export the app instead of listening here
module.exports = app;