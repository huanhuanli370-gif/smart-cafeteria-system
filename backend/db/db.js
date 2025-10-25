// backend/db/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

async function connectDB(withoutDatabase = false) {
  return await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: withoutDatabase ? undefined : DB_NAME,
    multipleStatements: true
  });
}

module.exports = { connectDB, DB_NAME };
