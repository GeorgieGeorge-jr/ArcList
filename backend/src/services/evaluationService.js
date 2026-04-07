const {
  getEvaluationByUserAndDate,
  upsertDailyEvaluation,
  getRecentEvaluationsByUser,
  getPlannedTasksForEvaluation,
} = require("../models/evaluationModel");

function safePercentage(numerator, denominator) {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(2));
}

function getCategoryFrequency(tasks, filterFn) {
  const counts = {};

  tasks.filter(filterFn).forEach((task) => {
    const key = task.tag_name || "Uncategorized";
    counts[key] = (counts[key] || 0) + 1;
  });

  return counts;
}

function getTopCategory(counts) {
  const entries = Object.entries(counts);
  if (!entries.length) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function buildSummary({
  completionPercentage,
  completedTasksCount,
  overdueTasksCount,
  strongestCategory,
}) {
  const parts = [];

  parts.push(`Completed ${completedTasksCount} tasks`);
  parts.push(`${completionPercentage}% completion`);

  if (overdueTasksCount > 0) {
    parts.push(`${overdueTasksCount} overdue`);
  }

  if (strongestCategory) {
    parts.push(`strongest category: ${strongestCategory}`);
  }

  return parts.join(" • ");
}

async function generateDailyEvaluation(userId, planDate) {
  const tasks = await getPlannedTasksForEvaluation(userId, planDate);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "completed");
  const pendingTasks = tasks.filter((task) => task.status !== "completed");

  const now = new Date();
  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    if (task.status === "completed") return false;
    return new Date(task.due_date) < now;
  });

  const completedCategoryCounts = getCategoryFrequency(
    tasks,
    (task) => task.status === "completed"
  );

  const skippedCategoryCounts = getCategoryFrequency(
    tasks,
    (task) => task.status !== "completed"
  );

  const strongestCategory = getTopCategory(completedCategoryCounts);
  const mostSkippedCategory = getTopCategory(skippedCategoryCounts);

  const totalEstimatedMinutesCompleted = completedTasks.reduce(
    (sum, task) => sum + Number(task.estimated_minutes || 0),
    0
  );

  const completionPercentage = safePercentage(completedTasks.length, totalTasks);

  const consistencyScore = Number(
    (
      completionPercentage * 0.7 +
      safePercentage(completedTasks.length, completedTasks.length + overdueTasks.length) * 0.3
    ).toFixed(2)
  );

  const summaryNote = buildSummary({
    completionPercentage,
    completedTasksCount: completedTasks.length,
    overdueTasksCount: overdueTasks.length,
    strongestCategory,
  });

  return upsertDailyEvaluation({
    userId,
    planDate,
    completionPercentage,
    completedTasksCount: completedTasks.length,
    pendingTasksCount: pendingTasks.length,
    overdueTasksCount: overdueTasks.length,
    strongestCategory,
    mostSkippedCategory,
    totalEstimatedMinutesCompleted,
    consistencyScore,
    summaryNote,
  });
}

async function getInsightsSnapshot(userId, planDate) {
  let evaluation = await getEvaluationByUserAndDate(userId, planDate);

  if (!evaluation) {
    evaluation = await generateDailyEvaluation(userId, planDate);
  }

  const recentEvaluations = await getRecentEvaluationsByUser(userId, 14);

  return {
    today: evaluation,
    recent: recentEvaluations,
  };
}

module.exports = {
  generateDailyEvaluation,
  getInsightsSnapshot,
};