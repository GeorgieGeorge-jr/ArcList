const { pool } = require("../config/db");

async function getDayPlanByUserAndDate(userId, planDate) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM day_plans
      WHERE user_id = ? AND plan_date = ?
      LIMIT 1
    `,
    [userId, planDate]
  );

  return rows[0] || null;
}

async function getDayPlanByIdAndUser(planId, userId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM day_plans
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `,
    [planId, userId]
  );

  return rows[0] || null;
}

async function createDayPlan({ userId, planDate, planningMode = "todo", notes = null }) {
  const [result] = await pool.query(
    `
      INSERT INTO day_plans (user_id, plan_date, planning_mode, notes)
      VALUES (?, ?, ?, ?)
    `,
    [userId, planDate, planningMode, notes]
  );

  const [rows] = await pool.query(
    `SELECT * FROM day_plans WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return rows[0];
}

async function updateDayPlan({ planId, planningMode, notes }) {
  await pool.query(
    `
      UPDATE day_plans
      SET planning_mode = ?, notes = ?
      WHERE id = ?
    `,
    [planningMode, notes, planId]
  );

  const [rows] = await pool.query(
    `SELECT * FROM day_plans WHERE id = ? LIMIT 1`,
    [planId]
  );

  return rows[0];
}

async function lockDayPlan(planId) {
  await pool.query(
    `
      UPDATE day_plans
      SET is_locked = TRUE, locked_at = NOW()
      WHERE id = ?
    `,
    [planId]
  );

  const [rows] = await pool.query(
    `SELECT * FROM day_plans WHERE id = ? LIMIT 1`,
    [planId]
  );

  return rows[0];
}

async function getPlanTasks(planId) {
  const [rows] = await pool.query(
    `
      SELECT
        dpt.id AS plan_task_id,
        dpt.day_plan_id,
        dpt.task_id,
        dpt.sort_order,
        dpt.planned_start,
        dpt.planned_end,
        dpt.added_after_lock,
        dpt.completed_in_plan,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.planning_mode,
        t.difficulty_level,
        t.estimated_minutes,
        t.due_date,
        t.reminder_at,
        tt.name AS tag_name,
        tt.color AS tag_color
      FROM day_plan_tasks dpt
      INNER JOIN tasks t ON dpt.task_id = t.id
      LEFT JOIN task_tags tt ON t.tag_id = tt.id
      WHERE dpt.day_plan_id = ?
      ORDER BY dpt.sort_order ASC, dpt.created_at ASC
    `,
    [planId]
  );

  return rows;
}

async function addTaskToPlan({
  dayPlanId,
  taskId,
  sortOrder = 0,
  plannedStart = null,
  plannedEnd = null,
  addedAfterLock = false,
}) {
  const [result] = await pool.query(
    `
      INSERT INTO day_plan_tasks (
        day_plan_id,
        task_id,
        sort_order,
        planned_start,
        planned_end,
        added_after_lock
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [dayPlanId, taskId, sortOrder, plannedStart, plannedEnd, addedAfterLock]
  );

  const [rows] = await pool.query(
    `
      SELECT *
      FROM day_plan_tasks
      WHERE id = ?
      LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0];
}

async function removeTaskFromPlan(planTaskId) {
  const [result] = await pool.query(
    `DELETE FROM day_plan_tasks WHERE id = ?`,
    [planTaskId]
  );

  return result.affectedRows > 0;
}

async function findPlanTaskById(planTaskId) {
  const [rows] = await pool.query(
    `SELECT * FROM day_plan_tasks WHERE id = ? LIMIT 1`,
    [planTaskId]
  );

  return rows[0] || null;
}

async function findTaskOwnedByUser(taskId, userId) {
  const [rows] = await pool.query(
    `SELECT * FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
    [taskId, userId]
  );

  return rows[0] || null;
}

async function findPlanTaskByPlanAndTask(dayPlanId, taskId) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM day_plan_tasks
      WHERE day_plan_id = ? AND task_id = ?
      LIMIT 1
    `,
    [dayPlanId, taskId]
  );

  return rows[0] || null;
}

module.exports = {
  getDayPlanByUserAndDate,
  getDayPlanByIdAndUser,
  createDayPlan,
  updateDayPlan,
  lockDayPlan,
  getPlanTasks,
  addTaskToPlan,
  removeTaskFromPlan,
  findPlanTaskById,
  findTaskOwnedByUser,
  findPlanTaskByPlanAndTask,
};