const { pool } = require("../config/db");

async function findUserByEmail(email) {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findUserByUsername(username) {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE username = ? LIMIT 1`,
    [username]
  );
  return rows[0] || null;
}

async function findUserByEmailOrUsername(identifier) {
  const [rows] = await pool.query(
    `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function createUser({
  displayName,
  username,
  email,
  passwordHash,
}) {
  const [result] = await pool.query(
    `
      INSERT INTO users (display_name, username, email, password_hash)
      VALUES (?, ?, ?, ?)
    `,
    [displayName, username, email, passwordHash]
  );

  const [rows] = await pool.query(
    `SELECT id, display_name, username, email, theme_name, created_at
     FROM users
     WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function incrementLoginCount(userId) {
  await pool.query(
    `UPDATE users SET login_count = login_count + 1 WHERE id = ?`,
    [userId]
  );
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserByEmailOrUsername,
  createUser,
  incrementLoginCount,
};