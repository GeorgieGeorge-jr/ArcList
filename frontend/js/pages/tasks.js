import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { getTasks, createTask, toggleTaskCompletion } from "../api/tasks.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";

const user = requireAuth();
bindLogoutButtons();
renderNotificationBadges();

const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserMeta = document.getElementById("sidebarUserMeta");
const tasksPageTitle = document.getElementById("tasksPageTitle");

if (user) {
  const firstName = user.display_name?.split(" ")[0] || user.username || "there";

  if (sidebarUserName) {
    sidebarUserName.textContent = user.display_name || firstName;
  }

  if (sidebarUserMeta) {
    sidebarUserMeta.textContent = `@${user.username}`;
  }

  if (tasksPageTitle) {
    tasksPageTitle.textContent = `${firstName}'s tasks`;
  }
}

const tasksList = document.getElementById("tasksList");
const tasksEmptyState = document.getElementById("tasksEmptyState");
const taskSearchInput = document.getElementById("taskSearchInput");
const priorityFilter = document.getElementById("priorityFilter");
const statusFilter = document.getElementById("statusFilter");

const taskModalBackdrop = document.getElementById("taskModalBackdrop");
const openTaskModalBtn = document.getElementById("openTaskModalBtn");
const closeTaskModalBtn = document.getElementById("closeTaskModalBtn");
const emptyStateAddTaskBtn = document.getElementById("emptyStateAddTaskBtn");
const createTaskForm = document.getElementById("createTaskForm");

let allTasks = [];

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

function renderTasks(tasks) {
  tasksList.innerHTML = "";

  if (!tasks.length) {
    tasksEmptyState.style.display = "block";
    tasksList.style.display = "none";
    return;
  }

  tasksEmptyState.style.display = "none";
  tasksList.style.display = "grid";

  tasks.forEach((task) => {
    const dueDate = formatDateTime(task.due_date);
    const reminderAt = formatDateTime(task.reminder_at);

    const taskCard = document.createElement("article");
    taskCard.className = "task-card";

    taskCard.innerHTML = `
      <div class="task-card-top">
        <div>
          <h3 class="task-card-title">${task.title}</h3>
          <span class="meta-pill ${getPriorityClass(task.priority)}">${task.priority}</span>
        </div>
        <span class="meta-pill">${task.status.replace("_", " ")}</span>
      </div>

      ${
        task.description
          ? `<p class="task-card-copy">${task.description}</p>`
          : ""
      }

      <div class="task-meta-row">
        <span class="meta-pill">Mode: ${task.planning_mode}</span>
        <span class="meta-pill">Difficulty: ${task.difficulty_level}/5</span>
        ${
          task.estimated_minutes
            ? `<span class="meta-pill">${task.estimated_minutes} mins</span>`
            : ""
        }
        ${
          task.tag_name
            ? `<span class="meta-pill">${task.tag_name}</span>`
            : ""
        }
      </div>

      <div class="task-meta-row">
        ${
          dueDate
            ? `<span class="meta-pill">Due: ${dueDate}</span>`
            : ""
        }
        ${
          reminderAt
            ? `<span class="meta-pill">Reminder: ${reminderAt}</span>`
            : ""
        }
      </div>

      <div class="planner-task-actions">
        <button class="btn ${task.status === "completed" ? "btn-secondary" : "btn-primary"}" data-toggle-task="${task.id}">
          ${task.status === "completed" ? "Mark Pending" : "Mark Complete"}
        </button>
      </div>
    `;

    tasksList.appendChild(taskCard);
  });

  document.querySelectorAll("[data-toggle-task]").forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.getAttribute("data-toggle-task");

      try {
        await toggleTaskCompletion(taskId);
        await loadTasks();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function applyFilters() {
  const searchValue = taskSearchInput.value.trim().toLowerCase();
  const priorityValue = priorityFilter.value;
  const statusValue = statusFilter.value;

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchValue) ||
      (task.description || "").toLowerCase().includes(searchValue);

    const matchesPriority = !priorityValue || task.priority === priorityValue;
    const matchesStatus = !statusValue || task.status === statusValue;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  renderTasks(filteredTasks);
}

async function loadTasks() {
  try {
    const result = await getTasks();
    allTasks = result.data || [];
    applyFilters();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function openTaskModal() {
  taskModalBackdrop.style.display = "grid";
}

function closeTaskModal() {
  taskModalBackdrop.style.display = "none";
  createTaskForm.reset();
}

openTaskModalBtn?.addEventListener("click", openTaskModal);
closeTaskModalBtn?.addEventListener("click", closeTaskModal);
emptyStateAddTaskBtn?.addEventListener("click", openTaskModal);

taskModalBackdrop?.addEventListener("click", (event) => {
  if (event.target === taskModalBackdrop) {
    closeTaskModal();
  }
});

taskSearchInput?.addEventListener("input", applyFilters);
priorityFilter?.addEventListener("change", applyFilters);
statusFilter?.addEventListener("change", applyFilters);

createTaskForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(createTaskForm);

  const payload = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    planningMode: formData.get("planningMode"),
    difficultyLevel: formData.get("difficultyLevel"),
    estimatedMinutes: formData.get("estimatedMinutes"),
    dueDate: formData.get("dueDate") || null,
    reminderAt: formData.get("reminderAt") || null,
  };

  try {
    await createTask(payload);
    closeTaskModal();
    await loadTasks();
  } catch (error) {
    alert(error.message);
  }
});

loadTasks();