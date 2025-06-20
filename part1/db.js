const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',          // your DB host
  user: 'root',               // your DB user
  password: 'Yes',            // your actual DB password
  database: 'dogwalkssql',// your actual DB name
  multipleStatements: true
});

module.exports = pool;
