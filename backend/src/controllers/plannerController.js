const {
  getPlannerSnapshot,
  savePlannerSettings,
  addExistingTaskToPlan,
  removePlannedTask,
  lockPlanner,
} = require("../services/plannerService");

async function getPlanner(req, res) {
  try {
    const userId = req.user.id;
    const { planDate } = req.query;

    const result = await getPlannerSnapshot(userId, planDate);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load planner.",
    });
  }
}

async function savePlanner(req, res) {
  try {
    const userId = req.user.id;
    const result = await savePlannerSettings(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Planner updated successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update planner.",
    });
  }
}

async function addTask(req, res) {
  try {
    const userId = req.user.id;
    const result = await addExistingTaskToPlan(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Task added to planner.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add task to planner.",
    });
  }
}

async function removeTask(req, res) {
  try {
    const userId = req.user.id;
    const { planTaskId } = req.params;

    const result = await removePlannedTask(userId, planTaskId);

    return res.status(200).json({
      success: true,
      message: "Task removed from planner.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove planned task.",
    });
  }
}

async function lockPlan(req, res) {
  try {
    const userId = req.user.id;
    const { planDate } = req.body;

    const result = await lockPlanner(userId, planDate);

    return res.status(200).json({
      success: true,
      message: "Plan locked successfully.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to lock plan.",
    });
  }
}

module.exports = {
  getPlanner,
  savePlanner,
  addTask,
  removeTask,
  lockPlan,
};