const {
  getUserNotifications,
  getNotificationSummary,
  markOneNotificationRead,
  markEverythingRead,
  generateTaskNotificationsForUser,
} = require("../services/notificationService");

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    await generateTaskNotificationsForUser(userId);
    const notifications = await getUserNotifications(userId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
}

async function getNotificationSummaryController(req, res) {
  try {
    const userId = req.user.id;

    await generateTaskNotificationsForUser(userId);
    const summary = await getNotificationSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("getNotificationSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load notification summary.",
    });
  }
}

async function generateNotificationsNow(req, res) {
  try {
    const userId = req.user.id;

    const result = await generateTaskNotificationsForUser(userId);

    return res.status(200).json({
      success: true,
      message: "Notifications generated.",
      data: result,
    });
  } catch (error) {
    console.error("generateNotificationsNow error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate notifications.",
    });
  }
}

async function markRead(req, res) {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await markOneNotificationRead(userId, notificationId);

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      data: notification,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update notification.",
    });
  }
}

async function markAllRead(req, res) {
  try {
    const userId = req.user.id;

    await markEverythingRead(userId);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read.",
    });
  }
}

module.exports = {
  getNotifications,
  getNotificationSummaryController,
  generateNotificationsNow,
  markRead,
  markAllRead,
};