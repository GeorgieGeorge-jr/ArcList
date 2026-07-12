const { getBacklogTasksByUserId } = require("../models/taskModel");
const { addTaskToPlan, getPlanTasks } = require("../models/plannerModel");
const { getUserSettingsById } = require("../models/userSettingsModel");

// How much longer/shorter a task gets versus the user's own default
// duration setting, based on priority. Keeps the auto-plan personalized
// to how long *this* user actually likes to work, rather than a fixed
// global number.
const PRIORITY_DURATION_MULTIPLIER = {
  urgent: 2,
  high: 1.5,
  medium: 1,
  low: 0.5,
};

function estimateDurationMinutes(task, defaultTaskDuration) {
  if (task.estimated_minutes) return task.estimated_minutes;
  const multiplier = PRIORITY_DURATION_MULTIPLIER[task.priority] || 1;
  return Math.round((defaultTaskDuration || 30) * multiplier);
}

// Selects backlog tasks for `plan` up to the user's daily hour cap,
// assigns a duration to each, and attaches them via day_plan_tasks.
// Already-attached tasks (e.g. recurring tasks expanded earlier that day)
// are respected — this only fills in the *remaining* capacity.
async function generateDailyPlan(userId, plan) {
  const settings = await getUserSettingsById(userId);
  const dailyCapMinutes = Math.round(
    (Number(settings?.daily_hour_cap) || 8) * 60
  );
  const defaultTaskDuration = Number(settings?.default_task_duration) || 30;

  const existingTasks = await getPlanTasks(plan.id);
  let usedMinutes = existingTasks.reduce(
    (sum, t) => sum + (t.planned_duration_minutes || t.estimated_minutes || 0),
    0
  );

  const backlog = await getBacklogTasksByUserId(userId, plan.id);

  const added = [];
  let sortOrder = existingTasks.length;

  for (const task of backlog) {
    const duration = estimateDurationMinutes(task, defaultTaskDuration);

    // Greedy fit: skip a task if it would overflow the cap, but keep
    // checking the rest of the backlog rather than stopping outright —
    // a later smaller task can still slot into the remaining capacity.
    // The only exception is the very first task: we always add at least
    // one so a single long task doesn't block generation entirely.
    if (usedMinutes + duration > dailyCapMinutes && added.length > 0) {
      continue;
    }

    await addTaskToPlan({
      dayPlanId: plan.id,
      taskId: task.id,
      sortOrder: sortOrder++,
      plannedDurationMinutes: duration,
      autoAssigned: true,
      addedAfterLock: Boolean(plan.is_locked),
    });

    usedMinutes += duration;
    added.push(task.id);
  }

  const tasks = await getPlanTasks(plan.id);

  return {
    plan,
    tasks,
    generated: {
      addedCount: added.length,
      usedMinutes,
      capMinutes: dailyCapMinutes,
    },
  };
}

module.exports = { generateDailyPlan };
