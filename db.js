const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'HotMeal'
});

db.connect(err => {
  if (err) {
    console.log("Database connection failed");
    throw err;
  }
    console.log("Connected to MySQL");
});

module.exports = db; 