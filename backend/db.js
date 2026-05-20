const mysql = require('mysql2/promise');
// const fs = require('fs');

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'webreto',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
  ssl: undefined/*process.env.DB_SSL === 'true'
    ? (process.env.DB_SSL_CA
        ? { ca: fs.readFileSync(process.env.DB_SSL_CA) }
        : { rejectUnauthorized: false }) // Solo para pruebas
    : undefined*/,
});

module.exports = db;