require('dotenv').config();
const { Pool } = require('pg');

const dbPassword = process.env.DB_PASSWORD || process.env.DB_PASS;
const dbHost = process.env.DB_HOST || 'localhost';
const poolConfig = {
  host: dbHost,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: dbPassword,
  database: process.env.DB_NAME,
  connectionTimeoutMillis: 10000,
};

if (process.env.DB_SSL === 'true' || (dbHost !== 'localhost' && dbHost !== '127.0.0.1' && dbHost !== '::1')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

(async () => {
  try {
    const res = await pool.query('SELECT COUNT(*) FROM data_entries;');
    console.log('✅ Connected. Row count:', res.rows[0].count);
  } catch (err) {
    console.error(`❌ Failed to connect to PostgreSQL at ${dbHost}:${poolConfig.port} (${process.env.DB_NAME || 'unknown database'}).`);
    console.error('Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_SSL values.');
    console.error(err.message);
  } finally {
    await pool.end();
  }
})();