const express = require("express");
const {
  createTask,
  getMyTasks,
  toggleTaskCompletion,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyTasks);
router.post("/", protect, createTask);
router.patch("/:taskId/toggle-complete", protect, toggleTaskCompletion);

module.exports = router;