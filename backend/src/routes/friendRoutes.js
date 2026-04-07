const express = require("express");
const {
  searchUsersController,
  sendFriendRequestController,
  getFriendOverviewController,
  respondToFriendRequestController,
  removeFriendController,
} = require("../controllers/friendController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", protect, searchUsersController);
router.get("/", protect, getFriendOverviewController);
router.post("/requests", protect, sendFriendRequestController);
router.patch("/requests/:requestId", protect, respondToFriendRequestController);
router.delete("/:friendId", protect, removeFriendController);

module.exports = router;