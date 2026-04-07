import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { getTasks } from "../api/tasks.js";
import {
  getPlanner,
  savePlanner,
  addTaskToPlanner,
  removeTaskFromPlanner,
  lockPlanner,
} from "../api/planner.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";

const user = requireAuth();
bindLogoutButtons();
renderNotificationBadges();

const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserMeta = document.getElementById("sidebarUserMeta");
const plannerTitle = document.getElementById("plannerTitle");

const plannerDate = document.getElementById("plannerDate");
const plannerMode = document.getElementById("plannerMode");
const plannerNotes = document.getElementById("plannerNotes");
const plannerLockStatus = document.getElementById("plannerLockStatus");
const plannerTaskCount = document.getElementById("plannerTaskCount");

const savePlannerBtn = document.getElementById("savePlannerBtn");
const lockPlannerBtn = document.getElementById("lockPlannerBtn");

const taskSelect = document.getElementById("taskSelect");
const addTaskToPlanForm = document.getElementById("addTaskToPlanForm");
const plannedStart = document.getElementById("plannedStart");
const plannedEnd = document.getElementById("plannedEnd");

const plannerEmptyState = document.getElementById("plannerEmptyState");
const plannerTasksList = document.getElementById("plannerTasksList");

const lockModalBackdrop = document.getElementById("lockModalBackdrop");
const cancelLockBtn = document.getElementById("cancelLockBtn");
const confirmLockBtn = document.getElementById("confirmLockBtn");

let currentPlan = null;
let currentPlanTasks = [];
let userTasks = [];

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

plannerDate.value = getTodayDateString();

if (user) {
  const firstName = user.display_name?.split(" ")[0] || user.username || "there";

  if (sidebarUserName) sidebarUserName.textContent = user.display_name || firstName;
  if (sidebarUserMeta) sidebarUserMeta.textContent = `@${user.username}`;
  if (plannerTitle) plannerTitle.textContent = `${firstName}'s planner`;
}

function formatDateTime(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getPriorityClass(priority) {
  switch (priority) {
    case "urgent":
      return "priority-urgent";
    case "high":
      return "priority-high";
    case "medium":
      return "priority-medium";
    case "low":
      return "priority-low";
    default:
      return "";
  }
}

function populateTaskSelect() {
  const plannedTaskIds = new Set(currentPlanTasks.map((task) => task.task_id));

  taskSelect.innerHTML = `<option value="">Select a task</option>`;

  const availableTasks = userTasks.filter((task) => !plannedTaskIds.has(task.id));

  availableTasks.forEach((task) => {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = `${task.title} (${task.priority})`;
    taskSelect.appendChild(option);
  });
}

function renderPlannerMeta() {
  plannerMode.value = currentPlan?.planning_mode || "todo";
  plannerNotes.value = currentPlan?.notes || "";
  plannerTaskCount.textContent = `${currentPlanTasks.length} task${currentPlanTasks.length === 1 ? "" : "s"} in plan`;

  if (currentPlan?.is_locked) {
    plannerLockStatus.textContent = "Locked";
    lockPlannerBtn.disabled = true;
    lockPlannerBtn.textContent = "Locked In";
  } else {
    plannerLockStatus.textContent = "Unlocked";
    lockPlannerBtn.disabled = false;
    lockPlannerBtn.textContent = "Lock In";
  }
}

function renderPlanTasks() {
  plannerTasksList.innerHTML = "";

  if (!currentPlanTasks.length) {
    plannerEmptyState.style.display = "block";
    plannerTasksList.style.display = "none";
    return;
  }

  plannerEmptyState.style.display = "none";
  plannerTasksList.style.display = "grid";

  currentPlanTasks.forEach((task) => {
    const card = document.createElement("article");
    card.className = "planner-task-card";

    const plannedWindow =
      task.planned_start || task.planned_end
        ? `${task.planned_start ? `Start: ${formatDateTime(task.planned_start)}` : ""} ${
            task.planned_end ? `• End: ${formatDateTime(task.planned_end)}` : ""
          }`
        : null;

    const canRemove = !currentPlan.is_locked || task.added_after_lock;

    card.innerHTML = `
      <div class="planner-task-top">
        <div>
          <h3 class="planner-task-title">${task.title}</h3>
          <span class="meta-pill ${getPriorityClass(task.priority)}">${task.priority}</span>
        </div>
        <span class="meta-pill">${task.planning_mode}</span>
      </div>

      ${task.description ? `<p class="planner-task-copy">${task.description}</p>` : ""}

      <div class="task-meta-row">
        <span class="meta-pill">Difficulty: ${task.difficulty_level}/5</span>
        ${task.estimated_minutes ? `<span class="meta-pill">${task.estimated_minutes} mins</span>` : ""}
        ${task.tag_name ? `<span class="meta-pill">${task.tag_name}</span>` : ""}
        ${task.added_after_lock ? `<span class="meta-pill">Added after lock</span>` : ""}
      </div>

      ${
        plannedWindow
          ? `<div class="task-meta-row"><span class="meta-pill">${plannedWindow}</span></div>`
          : ""
      }

      <div class="planner-task-actions">
        ${
          canRemove
            ? `<button class="btn btn-ghost" data-remove-plan-task="${task.plan_task_id}">Remove</button>`
            : `<span class="meta-pill">Locked task cannot be removed</span>`
        }
      </div>
    `;

    plannerTasksList.appendChild(card);
  });

  document.querySelectorAll("[data-remove-plan-task]").forEach((button) => {
    button.addEventListener("click", async () => {
      const planTaskId = button.getAttribute("data-remove-plan-task");

      try {
        const result = await removeTaskFromPlanner(planTaskId);
        currentPlan = result.data.plan;
        currentPlanTasks = result.data.tasks;
        renderPlannerMeta();
        renderPlanTasks();
        populateTaskSelect();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function loadPlanner() {
  try {
    const result = await getPlanner(plannerDate.value);
    currentPlan = result.data.plan;
    currentPlanTasks = result.data.tasks || [];

    renderPlannerMeta();
    renderPlanTasks();
    populateTaskSelect();
  } catch (error) {
    alert(error.message);
  }
}

async function loadUserTasks() {
  try {
    const result = await getTasks();
    userTasks = result.data || [];
    populateTaskSelect();
  } catch (error) {
    alert(error.message);
  }
}

savePlannerBtn.addEventListener("click", async () => {
  try {
    const result = await savePlanner({
      planDate: plannerDate.value,
      planningMode: plannerMode.value,
      notes: plannerNotes.value,
    });

    currentPlan = result.data.plan;
    currentPlanTasks = result.data.tasks || [];
    renderPlannerMeta();
    renderPlanTasks();
    alert("Planner saved.");
  } catch (error) {
    alert(error.message);
  }
});

addTaskToPlanForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const result = await addTaskToPlanner({
      planDate: plannerDate.value,
      taskId: taskSelect.value,
      plannedStart: plannedStart.value || null,
      plannedEnd: plannedEnd.value || null,
    });

    currentPlan = result.data.plan;
    currentPlanTasks = result.data.tasks || [];

    addTaskToPlanForm.reset();
    plannerDate.value = currentPlan.plan_date;

    renderPlannerMeta();
    renderPlanTasks();
    populateTaskSelect();
  } catch (error) {
    alert(error.message);
  }
});

plannerDate.addEventListener("change", async () => {
  await loadPlanner();
});

lockPlannerBtn.addEventListener("click", () => {
  lockModalBackdrop.style.display = "grid";
});

cancelLockBtn.addEventListener("click", () => {
  lockModalBackdrop.style.display = "none";
});

lockModalBackdrop.addEventListener("click", (event) => {
  if (event.target === lockModalBackdrop) {
    lockModalBackdrop.style.display = "none";
  }
});

confirmLockBtn.addEventListener("click", async () => {
  try {
    const result = await lockPlanner(plannerDate.value);
    currentPlan = result.data.plan;
    currentPlanTasks = result.data.tasks || [];

    lockModalBackdrop.style.display = "none";

    renderPlannerMeta();
    renderPlanTasks();
    populateTaskSelect();

    alert("Plan locked successfully.");
  } catch (error) {
    alert(error.message);
  }
});

async function initPlannerPage() {
  await loadUserTasks();
  await loadPlanner();
}

initPlannerPage();