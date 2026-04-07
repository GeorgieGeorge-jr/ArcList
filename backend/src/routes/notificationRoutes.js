const express = require("express");
const {
  getNotifications,
  getNotificationSummaryController,
  generateNotificationsNow,
  markRead,
  markAllRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/summary", protect, getNotificationSummaryController);
router.post("/generate-now", protect, generateNotificationsNow);
router.patch("/read-all", protect, markAllRead);
router.patch("/:notificationId/read", protect, markRead);

module.exports = router;