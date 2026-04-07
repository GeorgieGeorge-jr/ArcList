const { pool } = require("../config/db");

async function createTask(taskData) {
  const {
    userId,
    title,
    description,
    priority,
    planningMode,
    difficultyLevel,
    estimatedMinutes,
    dueDate,
    reminderAt,
  } = taskData;

  const [result] = await pool.query(
    `
      INSERT INTO tasks (
        user_id,
        title,
        description,
        priority,
        planning_mode,
        difficulty_level,
        estimated_minutes,
        due_date,
        reminder_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      userId,
      title,
      description,
      priority,
      planningMode,
      difficultyLevel,
      estimatedMinutes,
      dueDate,
      reminderAt,
    ]
  );

  const [rows] = await pool.query(
    `SELECT * FROM tasks WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function getTasksByUserId(userId) {
  const [rows] = await pool.query(
    `
      SELECT t.*, tt.name AS tag_name, tt.color AS tag_color
      FROM tasks t
      LEFT JOIN task_tags tt ON t.tag_id = tt.id
      WHERE t.user_id = ?
      ORDER BY
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC,
        t.created_at DESC
    `,
    [userId]
  );

  return rows;
}

async function findTaskByIdAndUserId(taskId, userId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM tasks
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [taskId, userId]
  );

  return rows[0] || null;
}

async function updateTaskCompletion(taskId, nextStatus) {
  const completedAt = nextStatus === "completed" ? new Date() : null;

  await pool.query(
    `
      UPDATE tasks
      SET status = ?, completed_at = ?
      WHERE id = ?
    `,
    [nextStatus, completedAt, taskId]
  );

  const [rows] = await pool.query(
    `SELECT * FROM tasks WHERE id = ? LIMIT 1`,
    [taskId]
  );

  return rows[0];
}

module.exports = {
  createTask,
  getTasksByUserId,
  findTaskByIdAndUserId,
  updateTaskCompletion,
};