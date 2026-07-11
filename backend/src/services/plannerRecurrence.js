const { pool } = require("../config/db");

/**
 * Expand recurring tasks into the day_plan_tasks table for a given plan date.
 *
 * Idempotent: does not create duplicate day_plan_tasks because day_plan_tasks has a unique (day_plan_id, task_id).
 *
 * Supported recurrence_pattern:
 * - "daily"  => every day
 * - "weekly" => once per week, anchored to the task's due_date (if present) else created_at
 *
 * Notes:
 * - This project’s current planning UI supports setting planned_start/planned_end when adding tasks manually.
 * - For auto-added recurring tasks, we default planned_start/planned_end to null, but you can enhance this later.
 */
async function expandRecurringTasksForDay({ userId, planId, planDate, isLocked }) {
  // Fetch candidate recurring tasks owned by this user.
  const [tasks] = await pool.query(
    `
    SELECT
      id,
      title,
      due_date,
      created_at,
      is_recurring,
      recurrence_pattern
    FROM tasks
    WHERE user_id = ?
      AND is_recurring = TRUE
      AND recurrence_pattern IS NOT NULL
      AND recurrence_pattern <> ''
    `,
    [userId]
  );

  if (!tasks.length) return { created: 0 };

  const planDay = planDate; // YYYY-MM-DD (string)
  const createdAfterCount = { created: 0 };

  // We keep a small transaction to prevent partial inserts.
  // (MySQL2 will implicitly start/commit if we use connection, but we keep it simple here.)
  for (const task of tasks) {
    const pattern = (task.recurrence_pattern || "").toLowerCase().trim();
    if (!pattern) continue;

    const anchor = task.due_date ? new Date(task.due_date) : new Date(task.created_at);
    if (Number.isNaN(anchor.getTime())) continue;

    const target = new Date(`${planDay}T00:00:00.000Z`);
    // If planDate is interpreted in local time, this could shift; but this app stores datetimes and dates in SQL,
    // and planner UI uses toISOString().slice(0,10), so UTC anchoring is acceptable for now.
    if (Number.isNaN(target.getTime())) continue;

    let shouldAdd = false;

    if (pattern === "daily") {
      shouldAdd = true;
    } else if (pattern === "weekly") {
      // Add if the day is the same weekday as anchor and target >= anchor date.
      const anchorWeekday = anchor.getUTCDay(); // 0-6
      shouldAdd = target >= new Date(anchor.toISOString().slice(0, 10) + "T00:00:00.000Z")
        && target.getUTCDay() === anchorWeekday;
    }

    if (!shouldAdd) continue;

    // Insert link if not exists.
    // Unique key: (day_plan_id, task_id)
    const addedAfterLock = Boolean(isLocked);

    // Use INSERT ... ON DUPLICATE KEY UPDATE for idempotency.
    await pool.query(
      `
      INSERT INTO day_plan_tasks (
        day_plan_id,
        task_id,
        sort_order,
        planned_start,
        planned_end,
        added_after_lock,
        completed_in_plan
      )
      VALUES (?, ?, ?, NULL, NULL, ?, false)
      ON CONFLICT (day_plan_id, task_id) DO UPDATE SET
        added_after_lock = EXCLUDED.added_after_lock
      `,
      [planId, task.id, 0, addedAfterLock]
    );

    createdAfterCount.created += 1;
  }

  return createdAfterCount;
}

module.exports = {
  expandRecurringTasksForDay,
};
