const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'YES',
  database: 'DogWalkService',
  multipleStatements: true
});



module.exports = pool;
