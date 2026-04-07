import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { hydrateAppShell } from "../utils/appShell.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";
import { getInsights, generateEvaluation } from "../api/evaluations.js";

requireAuth();
bindLogoutButtons();
hydrateAppShell({
  pageTitleId: "insightsTitle",
  pageTitleLabel: "insights",
});

const insightsDate = document.getElementById("insightsDate");
const generateInsightsBtn = document.getElementById("generateInsightsBtn");

const completionPercentageValue = document.getElementById("completionPercentageValue");
const completedTasksValue = document.getElementById("completedTasksValue");
const overdueTasksValue = document.getElementById("overdueTasksValue");
const strongestCategoryValue = document.getElementById("strongestCategoryValue");
const mostSkippedCategoryValue = document.getElementById("mostSkippedCategoryValue");
const estimatedMinutesCompletedValue = document.getElementById("estimatedMinutesCompletedValue");
const consistencyScoreValue = document.getElementById("consistencyScoreValue");
const summaryNoteValue = document.getElementById("summaryNoteValue");
const recentEvaluationsList = document.getElementById("recentEvaluationsList");

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

insightsDate.value = getTodayDateString();

function renderTodayEvaluation(evaluation) {
  completionPercentageValue.textContent = `${evaluation?.completion_percentage ?? 0}%`;
  completedTasksValue.textContent = evaluation?.completed_tasks_count ?? 0;
  overdueTasksValue.textContent = evaluation?.overdue_tasks_count ?? 0;
  strongestCategoryValue.textContent = evaluation?.strongest_category || "—";
  mostSkippedCategoryValue.textContent = evaluation?.most_skipped_category || "—";
  estimatedMinutesCompletedValue.textContent = `${evaluation?.total_estimated_minutes_completed ?? 0} minutes`;
  consistencyScoreValue.textContent = evaluation?.consistency_score ?? 0;
  summaryNoteValue.textContent = evaluation?.summary_note || "No evaluation generated yet.";
}

function renderRecentEvaluations(items) {
  recentEvaluationsList.innerHTML = "";

  if (!items?.length) {
    recentEvaluationsList.innerHTML = `
      <div class="notification-item">
        <h4>No recent evaluations</h4>
        <p>Your evaluation history will start appearing here.</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "notification-item";

    card.innerHTML = `
      <div class="notification-top">
        <h4>${item.plan_date}</h4>
        <span class="tag-pill">${item.completion_percentage}%</span>
      </div>
      <p>
        Completed: ${item.completed_tasks_count} •
        Overdue: ${item.overdue_tasks_count} •
        Consistency: ${item.consistency_score}
      </p>
    `;

    recentEvaluationsList.appendChild(card);
  });
}

async function loadInsights() {
  try {
    const result = await getInsights(insightsDate.value);
    renderTodayEvaluation(result.data.today);
    renderRecentEvaluations(result.data.recent);
    await renderNotificationBadges();
  } catch (error) {
    console.error("Insights load failed:", error);
    alert(error.message);
  }
}

generateInsightsBtn?.addEventListener("click", async () => {
  try {
    await generateEvaluation(insightsDate.value);
    await loadInsights();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

insightsDate?.addEventListener("change", loadInsights);

loadInsights();