import { getToken } from "../utils/session.js";

const API_BASE_URL = "http://localhost:5050/api";

async function getSettings() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/settings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch settings.");
  }

  return data;
}

async function updateSettings(payload) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update settings.");
  }

  return data;
}

export { getSettings, updateSettings };