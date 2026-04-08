import { getToken } from "../utils/session.js";

import { API_BASE_URL } from "../config.js";

async function getPlanner(planDate) {
  const token = getToken();
  const query = planDate ? `?planDate=${encodeURIComponent(planDate)}` : "";

  const response = await fetch(`${API_BASE_URL}/planner${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch planner.");
  }

  return data;
}

async function savePlanner(payload) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/planner`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to save planner.");
  }

  return data;
}

async function addTaskToPlanner(payload) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/planner/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add task to planner.");
  }

  return data;
}

async function removeTaskFromPlanner(planTaskId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/planner/tasks/${planTaskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove planned task.");
  }

  return data;
}

async function lockPlanner(planDate) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/planner/lock`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planDate }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to lock plan.");
  }

  return data;
}

export {
  getPlanner,
  savePlanner,
  addTaskToPlanner,
  removeTaskFromPlanner,
  lockPlanner,
};