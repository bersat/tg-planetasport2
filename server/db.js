require('dotenv').config();
const mysql = require('mysql2/promise');

const db = mysql.createPool({
    user: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME
})

module.exports = db;