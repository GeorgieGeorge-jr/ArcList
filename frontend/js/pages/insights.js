import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { showToast } from "../components/toast.js";
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
  const percent = Number(evaluation?.completion_percentage ?? 0);

  completionPercentageValue.textContent = `${percent}%`;
  completedTasksValue.textContent = evaluation?.completed_tasks_count ?? 0;
  overdueTasksValue.textContent = evaluation?.overdue_tasks_count ?? 0;
  strongestCategoryValue.textContent = evaluation?.strongest_category || "—";
  mostSkippedCategoryValue.textContent = evaluation?.most_skipped_category || "—";
  estimatedMinutesCompletedValue.textContent = `${evaluation?.total_estimated_minutes_completed ?? 0} minutes`;
  consistencyScoreValue.textContent = evaluation?.consistency_score ?? 0;
  summaryNoteValue.textContent = evaluation?.summary_note || "No evaluation generated yet.";

  const ring = document.getElementById("insightsHeroRing");
  const caption = document.getElementById("insightsHeroCaption");

  if (ring) {
    ring.setAttribute("data-percent", String(Math.round(percent)));
    ring.style.setProperty("--pct", String(Math.round(percent)));
  }

  if (caption) {
    caption.textContent = evaluation
      ? `${evaluation.completed_tasks_count ?? 0} tasks completed today`
      : "No evaluation generated yet.";
  }
}

function renderRecentEvaluations(items) {
  recentEvaluationsList.innerHTML = "";

  if (!items?.length) {
    recentEvaluationsList.innerHTML = `
      <div class="eval-row">
        <div class="eval-row-body">
          <h4>No recent evaluations</h4>
          <p>Your evaluation history will start appearing here.</p>
        </div>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const pct = Math.round(Number(item.completion_percentage ?? 0));
    const row = document.createElement("div");
    row.className = "eval-row";

    row.innerHTML = `
      <div class="eval-row-badge" style="--pct: ${pct};">${pct}%</div>
      <div class="eval-row-body">
        <h4>${item.plan_date}</h4>
        <p>${item.completed_tasks_count} done · ${item.overdue_tasks_count} overdue · consistency ${item.consistency_score}</p>
      </div>
    `;

    recentEvaluationsList.appendChild(row);
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
    showToast(error.message, "error");
  }
}

generateInsightsBtn?.addEventListener("click", async () => {
  try {
    await generateEvaluation(insightsDate.value);
    await loadInsights();
  } catch (error) {
    console.error(error);
    showToast(error.message, "error");
  }
});

insightsDate?.addEventListener("change", loadInsights);

loadInsights();