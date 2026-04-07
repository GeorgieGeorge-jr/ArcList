const { pool } = require("../config/db");

async function searchUsers(query, currentUserId) {
  const searchTerm = `%${query}%`;

  const [rows] = await pool.query(
    `
      SELECT
        u.id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.profile_visibility,
        u.allow_friend_requests,
        u.allow_collaboration
      FROM users u
      WHERE u.id != ?
        AND (
          u.username LIKE ?
          OR u.display_name LIKE ?
        )
      ORDER BY u.username ASC
      LIMIT 20
    `,
    [currentUserId, searchTerm, searchTerm]
  );

  return rows;
}

async function findUserById(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        username,
        display_name,
        avatar_url,
        profile_visibility,
        allow_friend_requests,
        allow_collaboration
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] || null;
}

async function findFriendRequest(senderId, receiverId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM friend_requests
      WHERE sender_id = ? AND receiver_id = ?
      LIMIT 1
    `,
    [senderId, receiverId]
  );

  return rows[0] || null;
}

async function createFriendRequest(senderId, receiverId) {
  const [result] = await pool.query(
    `
      INSERT INTO friend_requests (sender_id, receiver_id, status)
      VALUES (?, ?, 'pending')
    `,
    [senderId, receiverId]
  );

  const [rows] = await pool.query(
    `SELECT * FROM friend_requests WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function updateFriendRequestStatus(requestId, status) {
  await pool.query(
    `
      UPDATE friend_requests
      SET status = ?
      WHERE id = ?
    `,
    [status, requestId]
  );

  const [rows] = await pool.query(
    `SELECT * FROM friend_requests WHERE id = ? LIMIT 1`,
    [requestId]
  );

  return rows[0] || null;
}

async function getIncomingFriendRequests(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        fr.id,
        fr.status,
        fr.created_at,
        u.id AS sender_id,
        u.username AS sender_username,
        u.display_name AS sender_display_name,
        u.avatar_url AS sender_avatar_url
      FROM friend_requests fr
      INNER JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `,
    [userId]
  );

  return rows;
}

async function getOutgoingFriendRequests(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        fr.id,
        fr.status,
        fr.created_at,
        u.id AS receiver_id,
        u.username AS receiver_username,
        u.display_name AS receiver_display_name,
        u.avatar_url AS receiver_avatar_url
      FROM friend_requests fr
      INNER JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `,
    [userId]
  );

  return rows;
}

async function createFriendPair(userId, friendId) {
  await pool.query(
    `
      INSERT IGNORE INTO friends (user_id, friend_id)
      VALUES (?, ?), (?, ?)
    `,
    [userId, friendId, friendId, userId]
  );
}

async function findFriendship(userId, friendId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM friends
      WHERE user_id = ? AND friend_id = ?
      LIMIT 1
    `,
    [userId, friendId]
  );

  return rows[0] || null;
}

async function getFriendsByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        f.id,
        u.id AS friend_id,
        u.username,
        u.display_name,
        u.avatar_url,
        u.allow_collaboration,
        f.created_at
      FROM friends f
      INNER JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ?
      ORDER BY u.display_name ASC, u.username ASC
    `,
    [userId]
  );

  return rows;
}

async function removeFriendPair(userId, friendId) {
  await pool.query(
    `
      DELETE FROM friends
      WHERE (user_id = ? AND friend_id = ?)
         OR (user_id = ? AND friend_id = ?)
    `,
    [userId, friendId, friendId, userId]
  );
}

async function getFriendRequestById(requestId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM friend_requests
      WHERE id = ?
      LIMIT 1
    `,
    [requestId]
  );

  return rows[0] || null;
}

module.exports = {
  searchUsers,
  findUserById,
  findFriendRequest,
  createFriendRequest,
  updateFriendRequestStatus,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  createFriendPair,
  findFriendship,
  getFriendsByUserId,
  removeFriendPair,
  getFriendRequestById,
};