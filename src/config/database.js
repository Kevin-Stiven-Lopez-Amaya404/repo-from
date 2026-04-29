require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'appdb',
  user:     process.env.DB_USER     || 'appuser',
  password: process.env.DB_PASSWORD || 'apppassword',
  max:      parseInt(process.env.DB_POOL_MAX || '10'),
  idleTimeoutMillis:       parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
});

pool.on('connect', () => {
  console.log('[DB] Nueva conexión al pool establecida');
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en cliente inactivo:', err.message);
  process.exit(-1);
});

/**
 * Verifica conectividad con la base de datos.
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT NOW() AS now');
    console.log(`[DB] Conexión verificada: ${rows[0].now}`);
  } finally {
    client.release();
  }
}

module.exports = { pool, testConnection };
