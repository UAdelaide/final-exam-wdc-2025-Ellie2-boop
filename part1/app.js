const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.use(express.json());

async function setupDatabase() {
  try {
    const createSQL = `
      DROP DATABASE IF EXISTS DogWalkService;
      CREATE DATABASE DogWalkService;
      USE DogWalkService;

      CREATE TABLE Users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('owner', 'walker') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE Dogs (
          dog_id INT AUTO_INCREMENT PRIMARY KEY,
          owner_id INT NOT NULL,
          name VARCHAR(50) NOT NULL,
          size ENUM('small', 'medium', 'large') NOT NULL,
          FOREIGN KEY (owner_id) REFERENCES Users(user_id)
      );

      CREATE TABLE WalkRequests (
          request_id INT AUTO_INCREMENT PRIMARY KEY,
          dog_id INT NOT NULL,
          requested_time DATETIME NOT NULL,
          duration_minutes INT NOT NULL,
          location VARCHAR(255) NOT NULL,
          status ENUM('open', 'accepted', 'completed', 'cancelled') DEFAULT 'open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (dog_id) REFERENCES Dogs(dog_id)
      );

      CREATE TABLE WalkApplications (
          application_id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          walker_id INT NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
          FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
          FOREIGN KEY (walker_id) REFERENCES Users(user_id),
          CONSTRAINT unique_application UNIQUE (request_id, walker_id)
      );

      CREATE TABLE WalkRatings (
          rating_id INT AUTO_INCREMENT PRIMARY KEY,
          request_id INT NOT NULL,
          walker_id INT NOT NULL,
          owner_id INT NOT NULL,
          rating INT CHECK (rating BETWEEN 1 AND 5),
          comments TEXT,
          rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (request_id) REFERENCES WalkRequests(request_id),
          FOREIGN KEY (walker_id) REFERENCES Users(user_id),
          FOREIGN KEY (owner_id) REFERENCES Users(user_id),
          CONSTRAINT unique_rating_per_walk UNIQUE (request_id)
      );
    `;

    await pool.query(createSQL);

    const insertSQL = `
      USE DogWalkService;

      INSERT INTO Users (username, email, password_hash, role) VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('david789', 'david@example.com', 'hashed101', 'walker'),
      ('eve456', 'eve@example.com', 'hashed202', 'owner');

      INSERT INTO Dogs (name, size, owner_id) VALUES
      ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
      ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
      ('Rocky', 'large', (SELECT user_id FROM Users WHERE username = 'david789')),
      ('Luna', 'small', (SELECT user_id FROM Users WHERE username = 'eve456')),
      ('Charlie', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123'));

      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 07:00:00', 60, 'Central Park', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-11 18:00:00', 30, 'Riverside Walk', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Charlie'), '2025-06-12 10:00:00', 45, 'Maple Street', 'open');

      INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments) VALUES
      (3, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT user_id FROM Users WHERE username = 'david789'), 5, 'Great walk!'),
      (4, (SELECT user_id FROM Users WHERE username = 'bobwalker'), (SELECT user_id FROM Users WHERE username = 'eve456'), 4, 'Good job.');
    `;

    await pool.query(insertSQL);
    console.log("Database setup complete.");
  } catch (err) {
    console.error("Error setting up database:", err.message);
  }
}

app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM DogWalkService.Dogs d
      JOIN DogWalkService.Users u ON d.owner_id = u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location,
             u.username AS owner_username
      FROM DogWalkService.WalkRequests wr
      JOIN DogWalkService.Dogs d ON wr.dog_id = d.dog_id
      JOIN DogWalkService.Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open';
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        COUNT(r.rating_id) AS total_ratings,
        ROUND(AVG(r.rating), 1) AS average_rating,
        (
          SELECT COUNT(*)
          FROM DogWalkService.WalkRequests wr
          JOIN DogWalkService.WalkApplications wa ON wr.request_id = wa.request_id
          WHERE wr.status = 'completed' AND wa.walker_id = u.user_id
        ) AS completed_walks
      FROM DogWalkService.Users u
      LEFT JOIN DogWalkService.WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id;
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await setupDatabase();
});
