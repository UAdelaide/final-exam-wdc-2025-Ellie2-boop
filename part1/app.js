const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();// Declare app first
const PORT = 3000;

app.use(cors()); // Then use cors middleware
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('DogWalkService API is running');
});

// Get all dogs with their owner usernames (hardcoded)
app.get('/api/dogs', (req, res) => {
  const manualDogs = [
    { dog_name: 'Max', size: 'medium', owner_username: 'alice123' },
    { dog_name: 'Bella', size: 'small', owner_username: 'carol123' },
    { dog_name: 'Charlie', size: 'large', owner_username: 'ellie456' },
    { dog_name: 'Daisy', size: 'medium', owner_username: 'alice123' },
    { dog_name: 'Rocky', size: 'small', owner_username: 'carol123' },
  ];
  res.json(manualDogs);
});

// Get dogs by owner id (hardcoded sample)
app.get('/api/owner/:user_id/dogs', (req, res) => {
  const userId = req.params.user_id;
  const sampleDogs = {
    7: [{ dog_id: 2, name: 'Max' }, { dog_id: 5, name: 'Daisy' }],
    9: [{ dog_id: 3, name: 'Bella' }, { dog_id: 6, name: 'Rocky' }],
  };
  res.json(sampleDogs[userId] || []);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
