const express = require("express");
const {
  generateEvaluation,
  getInsights,
} = require("../controllers/evaluationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getInsights);
router.post("/generate", protect, generateEvaluation);

module.exports = router;