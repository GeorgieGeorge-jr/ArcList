import { getToken } from "../utils/session.js";

const API_BASE_URL = "http://localhost:5050/api";

async function getConversations() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/messages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load conversations.");
  }

  return data;
}

async function getConversation(friendId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/messages/${friendId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load conversation.");
  }

  return data;
}

async function sendMessage(receiverId, body) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId, body }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send message.");
  }

  return data;
}

export {
  getConversations,
  getConversation,
  sendMessage,
};