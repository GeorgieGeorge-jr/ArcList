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
    tagId,
    isRecurring,
    recurrencePattern,
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
        reminder_at,
        tag_id,
        is_recurring,
        recurrence_pattern
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      tagId || null,
      Boolean(isRecurring),
      isRecurring ? recurrencePattern || null : null,
    ]
  );

  const [rows] = await pool.query(
    `SELECT * FROM tasks WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

// Backlog = pending tasks not already attached to the given day's plan.
// This is what "Generate my day" picks from.
async function getBacklogTasksByUserId(userId, dayPlanId) {
  const [rows] = await pool.query(
    `
      SELECT t.*, tt.name AS tag_name, tt.color AS tag_color
      FROM tasks t
      LEFT JOIN task_tags tt ON t.tag_id = tt.id
      WHERE t.user_id = ?
        AND t.status = 'pending'
        AND NOT EXISTS (
          SELECT 1 FROM day_plan_tasks dpt
          WHERE dpt.task_id = t.id AND dpt.day_plan_id = ?
        )
      ORDER BY
        CASE WHEN t.due_date IS NOT NULL AND t.due_date < NOW() THEN 0 ELSE 1 END,
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC NULLS LAST,
        t.created_at ASC
    `,
    [userId, dayPlanId]
  );

  return rows;
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
  getBacklogTasksByUserId,
  findTaskByIdAndUserId,
  updateTaskCompletion,
};