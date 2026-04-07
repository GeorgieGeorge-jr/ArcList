const {
  generateDailyEvaluation,
  getInsightsSnapshot,
} = require("../services/evaluationService");

async function generateEvaluation(req, res) {
  try {
    const userId = req.user.id;
    const { planDate } = req.body;

    if (!planDate) {
      return res.status(400).json({
        success: false,
        message: "planDate is required.",
      });
    }

    const evaluation = await generateDailyEvaluation(userId, planDate);

    return res.status(200).json({
      success: true,
      message: "Daily evaluation generated.",
      data: evaluation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate evaluation.",
    });
  }
}

async function getInsights(req, res) {
  try {
    const userId = req.user.id;
    const planDate =
      req.query.planDate || new Date().toISOString().slice(0, 10);

    const snapshot = await getInsightsSnapshot(userId, planDate);

    return res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load insights.",
    });
  }
}

module.exports = {
  generateEvaluation,
  getInsights,
};