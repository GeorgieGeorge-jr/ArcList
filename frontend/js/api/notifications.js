import { getToken } from "../utils/session.js";

import { API_BASE_URL } from "../config.js";

async function getNotifications() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notifications.");
  }

  return data;
}

async function getNotificationSummary() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/notifications/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notification summary.");
  }

  return data;
}

async function generateNotificationsNow() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/notifications/generate-now`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate notifications.");
  }

  return data;
}

async function markNotificationRead(notificationId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to mark notification as read.");
  }

  return data;
}

async function markAllNotificationsRead() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to mark all notifications as read.");
  }

  return data;
}

export {
  getNotifications,
  getNotificationSummary,
  generateNotificationsNow,
  markNotificationRead,
  markAllNotificationsRead,
};