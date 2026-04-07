const {
  createNotification,
  getNotificationsByUserId,
  getUnreadNotificationCountByUserId,
  getRecentNotificationsByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  findDueTaskReminderCandidates,
  findOverdueTaskCandidates,
  findDailyReviewCandidate,
} = require("../models/notificationModel");
const { getUserSettingsById } = require("../models/userSettingsModel");

async function getUserNotifications(userId) {
  return getNotificationsByUserId(userId);
}

async function getNotificationSummary(userId) {
  const unreadCount = await getUnreadNotificationCountByUserId(userId);
  const recent = await getRecentNotificationsByUserId(userId, 5);

  return {
    unreadCount,
    recent,
  };
}

async function markOneNotificationRead(userId, notificationId) {
  const updated = await markNotificationAsRead(notificationId, userId);

  if (!updated) {
    throw new Error("Notification not found.");
  }

  return updated;
}

async function markEverythingRead(userId) {
  await markAllNotificationsAsRead(userId);
  return true;
}

async function generateTaskNotificationsForUser(userId) {
  const settings = await getUserSettingsById(userId);

  if (!settings || !settings.notifications_enabled) {
    return { created: 0 };
  }

  let createdCount = 0;

  if (settings.reminder_notifications) {
    const reminderCandidates = await findDueTaskReminderCandidates(userId);

    for (const task of reminderCandidates) {
      await createNotification({
        userId,
        type: "task_reminder",
        title: "Task reminder",
        message: `Your task "${task.title}" is due for attention now.`,
        relatedTaskId: task.id,
        scheduledFor: task.reminder_at,
      });

      createdCount += 1;
    }

    const overdueCandidates = await findOverdueTaskCandidates(userId);

    for (const task of overdueCandidates) {
      await createNotification({
        userId,
        type: "overdue_alert",
        title: "Task overdue",
        message: `"${task.title}" is overdue. Try to reschedule it or clear it today.`,
        relatedTaskId: task.id,
        scheduledFor: task.due_date,
      });

      createdCount += 1;
    }
  }

  if (settings.daily_review_notifications) {
    const dailyReview = await findDailyReviewCandidate(userId);

    if (!dailyReview.alreadyExistsToday) {
      await createNotification({
        userId,
        type: "daily_review",
        title: "Daily review",
        message:
          dailyReview.pendingCount > 0
            ? `You still have ${dailyReview.pendingCount} unfinished task${dailyReview.pendingCount === 1 ? "" : "s"}. Review your day and close it out well.`
            : "Your day looks clear. Take a moment to review your progress and reflect.",
        scheduledFor: new Date(),
      });

      createdCount += 1;
    }
  }

  return { created: createdCount };
}

module.exports = {
  getUserNotifications,
  getNotificationSummary,
  markOneNotificationRead,
  markEverythingRead,
  generateTaskNotificationsForUser,
};