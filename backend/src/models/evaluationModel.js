const { pool } = require("../config/db");

async function getEvaluationByUserAndDate(userId, planDate) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM daily_evaluations
      WHERE user_id = ? AND plan_date = ?
      LIMIT 1
    `,
    [userId, planDate]
  );

  return rows[0] || null;
}

async function upsertDailyEvaluation({
  userId,
  planDate,
  completionPercentage,
  completedTasksCount,
  pendingTasksCount,
  overdueTasksCount,
  strongestCategory,
  mostSkippedCategory,
  totalEstimatedMinutesCompleted,
  consistencyScore,
  summaryNote,
}) {
  await pool.query(
    `
      INSERT INTO daily_evaluations (
        user_id,
        plan_date,
        completion_percentage,
        completed_tasks_count,
        pending_tasks_count,
        overdue_tasks_count,
        strongest_category,
        most_skipped_category,
        total_estimated_minutes_completed,
        consistency_score,
        summary_note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        completion_percentage = VALUES(completion_percentage),
        completed_tasks_count = VALUES(completed_tasks_count),
        pending_tasks_count = VALUES(pending_tasks_count),
        overdue_tasks_count = VALUES(overdue_tasks_count),
        strongest_category = VALUES(strongest_category),
        most_skipped_category = VALUES(most_skipped_category),
        total_estimated_minutes_completed = VALUES(total_estimated_minutes_completed),
        consistency_score = VALUES(consistency_score),
        summary_note = VALUES(summary_note)
    `,
    [
      userId,
      planDate,
      completionPercentage,
      completedTasksCount,
      pendingTasksCount,
      overdueTasksCount,
      strongestCategory,
      mostSkippedCategory,
      totalEstimatedMinutesCompleted,
      consistencyScore,
      summaryNote,
    ]
  );

  const [rows] = await pool.query(
    `
      SELECT *
      FROM daily_evaluations
      WHERE user_id = ? AND plan_date = ?
      LIMIT 1
    `,
    [userId, planDate]
  );

  return rows[0];
}

async function getRecentEvaluationsByUser(userId, limit = 30) {
  const [rows] = await pool.query(
    `
      SELECT *
      FROM daily_evaluations
      WHERE user_id = ?
      ORDER BY plan_date DESC
      LIMIT ?
    `,
    [userId, Number(limit)]
  );

  return rows;
}

async function getPlannedTasksForEvaluation(userId, planDate) {
  const [rows] = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.status,
        t.priority,
        t.estimated_minutes,
        t.due_date,
        t.completed_at,
        tt.name AS tag_name
      FROM day_plans dp
      INNER JOIN day_plan_tasks dpt ON dp.id = dpt.day_plan_id
      INNER JOIN tasks t ON dpt.task_id = t.id
      LEFT JOIN task_tags tt ON t.tag_id = tt.id
      WHERE dp.user_id = ? AND dp.plan_date = ?
    `,
    [userId, planDate]
  );

  return rows;
}

module.exports = {
  getEvaluationByUserAndDate,
  upsertDailyEvaluation,
  getRecentEvaluationsByUser,
  getPlannedTasksForEvaluation,
};