const { Pool } = require("pg");

// Render gives you a DATABASE_URL (or "Internal/External Database URL").
// Fall back to discrete PG* vars if you ever prefer those instead.
const connectionConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.PGSSL === "false"
          ? false
          : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    };

const pgPool = new Pool({
  ...connectionConfig,
  max: 10,
});

/**
 * Compatibility shim so every existing model file (written for mysql2)
 * keeps working unmodified against Postgres:
 *
 *   const [rows] = await pool.query("SELECT * FROM x WHERE id = ?", [id]);
 *   const [result] = await pool.query("INSERT INTO x (...) VALUES (?)", [v]);
 *   result.insertId / result.affectedRows
 *
 * - Converts positional "?" placeholders to Postgres "$1, $2, ..."
 * - Auto-appends "RETURNING id" to INSERT statements so insertId works
 * - Maps rowCount -> affectedRows for UPDATE/DELETE
 */
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

async function query(sql, params = []) {
  const trimmed = sql.trim();
  const isInsert = /^INSERT/i.test(trimmed);
  const needsReturning = isInsert && !/RETURNING/i.test(trimmed);

  const finalSql = toPgPlaceholders(sql) + (needsReturning ? " RETURNING id" : "");

  const result = await pgPool.query(finalSql, params);

  if (result.command === "SELECT") {
    return [result.rows];
  }

  // INSERT / UPDATE / DELETE: mimic mysql2's ResultSetHeader shape
  return [
    {
      insertId: result.rows && result.rows[0] ? result.rows[0].id : undefined,
      affectedRows: result.rowCount,
    },
  ];
}

const pool = { query };

async function testConnection() {
  const client = await pgPool.connect();
  console.log("✅ Database connected successfully");
  client.release();
}

module.exports = {
  pool,
  testConnection,
};
