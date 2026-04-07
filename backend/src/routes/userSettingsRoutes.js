const express = require("express");
const {
  getSettings,
  updateSettings,
} = require("../controllers/userSettingsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);

module.exports = router;