// backend/src/db.js

const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'farm_portal',
  password: '123456',
  port: 5432,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to database:', err.stack);
  } else {
    console.log('✅ Connected to PostgreSQL database successfully!');
    release();
  }
});

module.exports = pool;