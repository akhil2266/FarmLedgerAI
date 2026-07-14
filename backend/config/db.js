const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  queueLimit: 0,
  dateStrings: true,
  namedPlaceholders: true,
});

/**
 * Simple helper to run a query and return only rows.
 * @param {string} sql
 * @param {object|array} params
 */
const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

/**
 * Run a set of operations inside a transaction.
 * `callback` receives a connection with the same `.query` signature.
 */
const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

const testConnection = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
    // eslint-disable-next-line no-console
    console.log(`[db] Connected to MySQL database "${env.db.database}" @ ${env.db.host}:${env.db.port}`);
  } finally {
    connection.release();
  }
};

module.exports = { pool, query, withTransaction, testConnection };
