const { pool } = require("../config/db");

async function getConversationList(userId) {
  const [friends] = await pool.query(
    `
      SELECT
        u.id AS friend_id,
        u.username,
        u.display_name,
        u.avatar_url
      FROM friends f
      INNER JOIN users u ON f.friend_id = u.id
      WHERE f.user_id = ?
      ORDER BY u.display_name ASC, u.username ASC
    `,
    [userId]
  );

  // Now enrich each friend with last message + unread count
  const conversations = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRows] = await pool.query(
        `
          SELECT body, created_at
          FROM messages
          WHERE
            (sender_id = ? AND receiver_id = ?)
            OR
            (sender_id = ? AND receiver_id = ?)
          ORDER BY created_at DESC
          LIMIT 1
        `,
        [userId, friend.friend_id, friend.friend_id, userId]
      );

      const [unreadRows] = await pool.query(
        `
          SELECT COUNT(*) AS unread_count
          FROM messages
          WHERE sender_id = ?
            AND receiver_id = ?
            AND is_read = FALSE
        `,
        [friend.friend_id, userId]
      );

      return {
        ...friend,
        last_message_body: lastMessageRows[0]?.body || null,
        last_message_time: lastMessageRows[0]?.created_at || null,
        unread_count: unreadRows[0]?.unread_count || 0,
      };
    })
  );

  return conversations;
}

async function getMessagesBetweenUsers(userId, friendId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM messages
      WHERE
        (sender_id = ? AND receiver_id = ?)
        OR
        (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `,
    [userId, friendId, friendId, userId]
  );

  return rows;
}

async function createMessage(senderId, receiverId, body) {
  const [result] = await pool.query(
    `
      INSERT INTO messages (sender_id, receiver_id, body)
      VALUES (?, ?, ?)
    `,
    [senderId, receiverId, body]
  );

  const [rows] = await pool.query(
    `SELECT * FROM messages WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function markConversationAsRead(userId, friendId) {
  await pool.query(
    `
      UPDATE messages
      SET is_read = TRUE
      WHERE sender_id = ? AND receiver_id = ? AND is_read = FALSE
    `,
    [friendId, userId]
  );

  return true;
}

module.exports = {
  getConversationList,
  getMessagesBetweenUsers,
  createMessage,
  markConversationAsRead,
};