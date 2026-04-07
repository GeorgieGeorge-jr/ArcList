const {
  createUserTask,
  getUserTasks,
  toggleUserTaskCompletion,
} = require("../services/taskService");

async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const task = await createUserTask(userId, req.body);

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create task.",
    });
  }
}

async function getMyTasks(req, res) {
  try {
    const userId = req.user.id;
    const tasks = await getUserTasks(userId);

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tasks.",
    });
  }
}

async function toggleTaskCompletion(req, res) {
  try {
    const userId = req.user.id;
    const { taskId } = req.params;

    const task = await toggleUserTaskCompletion(userId, taskId);

    return res.status(200).json({
      success: true,
      message: "Task completion updated.",
      data: task,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update task completion.",
    });
  }
}

module.exports = {
  createTask,
  getMyTasks,
  toggleTaskCompletion,
};