const express = require("express");
const {
  getPlanner,
  savePlanner,
  addTask,
  removeTask,
  lockPlan,
  generatePlan,
  updateTaskDuration,
} = require("../controllers/plannerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getPlanner);
router.put("/", protect, savePlanner);
router.post("/generate", protect, generatePlan);
router.post("/tasks", protect, addTask);
router.patch("/tasks/:planTaskId/duration", protect, updateTaskDuration);
router.delete("/tasks/:planTaskId", protect, removeTask);
router.post("/lock", protect, lockPlan);

module.exports = router;
