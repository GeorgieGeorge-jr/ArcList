import { getToken } from "../utils/session.js";

import { API_BASE_URL } from "../config.js";

async function getTasks() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch tasks.");
  }

  return data;
}

async function createTask(payload) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create task.");
  }

  return data;
}

async function toggleTaskCompletion(taskId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/toggle-complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update task completion.");
  }

  return data;
}

export { getTasks, createTask, toggleTaskCompletion };