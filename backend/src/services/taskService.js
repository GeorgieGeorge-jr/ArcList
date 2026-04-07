const {
  createTask,
  getTasksByUserId,
  findTaskByIdAndUserId,
  updateTaskCompletion,
} = require("../models/taskModel");

async function createUserTask(userId, payload) {
  if (!payload.title || !payload.title.trim()) {
    throw new Error("Task title is required.");
  }

  return createTask({
    userId,
    title: payload.title.trim(),
    description: payload.description?.trim() || null,
    priority: payload.priority || "medium",
    planningMode: payload.planningMode || "todo",
    difficultyLevel: Number(payload.difficultyLevel || 3),
    estimatedMinutes: payload.estimatedMinutes
      ? Number(payload.estimatedMinutes)
      : null,
    dueDate: payload.dueDate || null,
    reminderAt: payload.reminderAt || null,
  });
}

async function getUserTasks(userId) {
  return getTasksByUserId(userId);
}

async function toggleUserTaskCompletion(userId, taskId) {
  const task = await findTaskByIdAndUserId(Number(taskId), userId);

  if (!task) {
    throw new Error("Task not found.");
  }

  const nextStatus =
    task.status === "completed" ? "pending" : "completed";

  return updateTaskCompletion(task.id, nextStatus);
}

module.exports = {
  createUserTask,
  getUserTasks,
  toggleUserTaskCompletion,
};