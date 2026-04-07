const express = require("express");
const {
  getConversationsController,
  getConversationController,
  sendMessageController,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getConversationsController);
router.get("/:friendId", protect, getConversationController);
router.post("/", protect, sendMessageController);

module.exports = router;