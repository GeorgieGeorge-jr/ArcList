const {
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
} = require("../models/plannerModel");

function normalizeDate(planDate) {
  if (!planDate) {
    return new Date().toISOString().slice(0, 10);
  }
  return planDate;
}

async function ensureDayPlan(userId, planDate) {
  const normalizedDate = normalizeDate(planDate);

  let plan = await getDayPlanByUserAndDate(userId, normalizedDate);

  if (!plan) {
    plan = await createDayPlan({
      userId,
      planDate: normalizedDate,
      planningMode: "todo",
      notes: null,
    });
  }

  return plan;
}

async function getPlannerSnapshot(userId, planDate) {
  const plan = await ensureDayPlan(userId, planDate);
  const tasks = await getPlanTasks(plan.id);

  return { plan, tasks };
}

async function savePlannerSettings(userId, payload) {
  const plan = await ensureDayPlan(userId, payload.planDate);

  const updatedPlan = await updateDayPlan({
    planId: plan.id,
    planningMode: payload.planningMode || plan.planning_mode,
    notes: payload.notes ?? plan.notes,
  });

  const tasks = await getPlanTasks(updatedPlan.id);

  return { plan: updatedPlan, tasks };
}

async function addExistingTaskToPlan(userId, payload) {
  const plan = await ensureDayPlan(userId, payload.planDate);
  const taskId = Number(payload.taskId);

  if (!taskId) {
    throw new Error("Task ID is required.");
  }

  const ownedTask = await findTaskOwnedByUser(taskId, userId);
  if (!ownedTask) {
    throw new Error("Task not found for this user.");
  }

  const existingLink = await findPlanTaskByPlanAndTask(plan.id, taskId);
  if (existingLink) {
    throw new Error("Task already exists in this day plan.");
  }

  const addedAfterLock = Boolean(plan.is_locked);

  await addTaskToPlan({
    dayPlanId: plan.id,
    taskId,
    sortOrder: Number(payload.sortOrder || 0),
    plannedStart: payload.plannedStart || null,
    plannedEnd: payload.plannedEnd || null,
    addedAfterLock,
  });

  const tasks = await getPlanTasks(plan.id);

  return { plan, tasks };
}

async function removePlannedTask(userId, planTaskId) {
  const planTask = await findPlanTaskById(Number(planTaskId));

  if (!planTask) {
    throw new Error("Planned task not found.");
  }

  const plan = await getDayPlanByIdAndUser(planTask.day_plan_id, userId);

  if (!plan) {
    throw new Error("You do not have access to this planned task.");
  }

  if (plan.is_locked && !planTask.added_after_lock) {
    throw new Error("Locked plan tasks cannot be removed after lock-in.");
  }

  await removeTaskFromPlan(planTask.id);
  const tasks = await getPlanTasks(plan.id);

  return { plan, tasks };
}

async function lockPlanner(userId, planDate) {
  const plan = await ensureDayPlan(userId, planDate);

  if (plan.is_locked) {
    const tasks = await getPlanTasks(plan.id);
    return { plan, tasks };
  }

  const lockedPlan = await lockDayPlan(plan.id);
  const tasks = await getPlanTasks(lockedPlan.id);

  return { plan: lockedPlan, tasks };
}

module.exports = {
  getPlannerSnapshot,
  savePlannerSettings,
  addExistingTaskToPlan,
  removePlannedTask,
  lockPlanner,
};