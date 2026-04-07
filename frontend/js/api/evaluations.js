import { getToken } from "../utils/session.js";

const API_BASE_URL = "http://localhost:5050/api";

async function getInsights(planDate) {
  const token = getToken();
  const query = planDate ? `?planDate=${encodeURIComponent(planDate)}` : "";

  const response = await fetch(`${API_BASE_URL}/evaluations${query}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch insights.");
  }

  return data;
}

async function generateEvaluation(planDate) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/evaluations/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planDate }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to generate evaluation.");
  }

  return data;
}

export { getInsights, generateEvaluation };