const { pool } = require("../config/db");

async function getUserSettingsById(userId) {
  const [rows] = await pool.query(
    `
      SELECT
        id,
        username,
        email,
        display_name,
        avatar_url,
        theme,
        default_planning_mode,
        default_task_duration,
        notifications_enabled,
        reminder_notifications,
        daily_review_notifications,
        collaboration_notifications,
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

async function updateUserSettingsById(userId, payload) {
  const {
    displayName,
    avatarUrl,
    theme,
    defaultPlanningMode,
    defaultTaskDuration,
    notificationsEnabled,
    reminderNotifications,
    dailyReviewNotifications,
    collaborationNotifications,
    profileVisibility,
    allowFriendRequests,
    allowCollaboration,
  } = payload;

  await pool.query(
    `
      UPDATE users
      SET
        display_name = ?,
        avatar_url = ?,
        theme = ?,
        default_planning_mode = ?,
        default_task_duration = ?,
        notifications_enabled = ?,
        reminder_notifications = ?,
        daily_review_notifications = ?,
        collaboration_notifications = ?,
        profile_visibility = ?,
        allow_friend_requests = ?,
        allow_collaboration = ?
      WHERE id = ?
    `,
    [
      displayName,
      avatarUrl,
      theme,
      defaultPlanningMode,
      defaultTaskDuration,
      notificationsEnabled,
      reminderNotifications,
      dailyReviewNotifications,
      collaborationNotifications,
      profileVisibility,
      allowFriendRequests,
      allowCollaboration,
      userId,
    ]
  );

  return getUserSettingsById(userId);
}

module.exports = {
  getUserSettingsById,
  updateUserSettingsById,
};