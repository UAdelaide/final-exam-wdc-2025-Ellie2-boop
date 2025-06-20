const mysql = require('mysql2/promise');

console.log("🔍 DB config loaded");


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Yes',
  database: 'DogWalkService',
  multipleStatements: true
});



module.exports = pool;
