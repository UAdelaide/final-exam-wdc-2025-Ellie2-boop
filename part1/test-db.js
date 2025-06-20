const mysql = require('mysql2/promise');

async function test() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Yes',
      database: 'DogWalkService',
    });

    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    console.log('Test query result:', rows);
  } catch (err) {
    console.error('DB connection test error:', err.message);
  }
}

test();
