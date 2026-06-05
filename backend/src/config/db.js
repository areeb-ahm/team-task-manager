// ─── Load Environment Variables ───────────────────────────────────────────────
const dotenv = require('dotenv');
dotenv.config();

// ─── PostgreSQL Connection Pool ──────────────────────────────────────────────
const { Pool } = require('pg');

// Create a connection pool using the DATABASE_URL from .env
// SSL is enabled with rejectUnauthorized: false for Google Cloud SQL compatibility
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// ─── Test Database Connection ────────────────────────────────────────────────
// Run a simple query on startup to verify the database is reachable
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
};

testConnection();

// ─── Export ──────────────────────────────────────────────────────────────────
// Export the pool so other modules can run queries against the database
module.exports = pool;
