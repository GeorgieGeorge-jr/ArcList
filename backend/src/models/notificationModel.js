const { pool } = require("../config/db");

async function createNotification({
  userId,
  type = "system",
  title,
  message,
  relatedTaskId = null,
  relatedRequestId = null,
  scheduledFor = null,
}) {
  const [result] = await pool.query(
    `
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_task_id,
        related_request_id,
        scheduled_for
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [userId, type, title, message, relatedTaskId, relatedRequestId, scheduledFor]
  );

  const [rows] = await pool.query(
    `SELECT * FROM notifications WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function getNotificationsByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY
        is_read ASC,
        COALESCE(scheduled_for, created_at) DESC
    `,
    [userId]
  );

  return rows;
}

async function getUnreadNotificationCountByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT COUNT(*) AS unread_count
      FROM notifications
      WHERE user_id = ? AND is_read = FALSE
    `,
    [userId]
  );

  return rows[0]?.unread_count || 0;
}

async function getRecentNotificationsByUserId(userId, limit = 5) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY
        is_read ASC,
        COALESCE(scheduled_for, created_at) DESC
      LIMIT ?
    `,
    [userId, Number(limit)]
  );

  return rows;
}

async function markNotificationAsRead(notificationId, userId) {
  await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ? AND user_id = ?
    `,
    [notificationId, userId]
  );

  const [rows] = await pool.query(
    `
      SELECT *
      FROM notifications
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [notificationId, userId]
  );

  return rows[0] || null;
}

async function markAllNotificationsAsRead(userId) {
  await pool.query(
    `
      UPDATE notifications
      SET is_read = TRUE
      WHERE user_id = ? AND is_read = FALSE
    `,
    [userId]
  );

  return true;
}

async function findDueTaskReminderCandidates(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.reminder_at,
        t.due_date
      FROM tasks t
      WHERE t.user_id = ?
        AND t.reminder_at IS NOT NULL
        AND t.status != 'completed'
        AND t.reminder_at <= NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM notifications n
          WHERE n.user_id = t.user_id
            AND n.related_task_id = t.id
            AND n.type = 'task_reminder'
        )
    `,
    [userId]
  );

  return rows;
}

async function findOverdueTaskCandidates(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.due_date
      FROM tasks t
      WHERE t.user_id = ?
        AND t.due_date IS NOT NULL
        AND t.status != 'completed'
        AND t.due_date < NOW()
        AND NOT EXISTS (
          SELECT 1
          FROM notifications n
          WHERE n.user_id = t.user_id
            AND n.related_task_id = t.id
            AND n.type = 'overdue_alert'
        )
    `,
    [userId]
  );

  return rows;
}

async function findDailyReviewCandidate(userId) {
  const [taskRows] = await pool.query(
    `
      SELECT COUNT(*) AS pending_count
      FROM tasks
      WHERE user_id = ?
        AND status != 'completed'
    `,
    [userId]
  );

  const pendingCount = taskRows[0]?.pending_count || 0;

  const [existingRows] = await pool.query(
    `
      SELECT id
      FROM notifications
      WHERE user_id = ?
        AND type = 'daily_review'
        AND DATE(created_at) = CURDATE()
      LIMIT 1
    `,
    [userId]
  );

  return {
    pendingCount,
    alreadyExistsToday: Boolean(existingRows[0]),
  };
}

module.exports = {
  createNotification,
  getNotificationsByUserId,
  getUnreadNotificationCountByUserId,
  getRecentNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  findDueTaskReminderCandidates,
  findOverdueTaskCandidates,
  findDailyReviewCandidate,
};