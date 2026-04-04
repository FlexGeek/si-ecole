const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

let pool;

if (process.env.DATABASE_URL) {
  // Utilisation de l'URL fournie par Render (ou autre service cloud)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // obligatoire pour Render
    }
  });
} else {
  // Environnement local (développement)
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
}

module.exports = pool;