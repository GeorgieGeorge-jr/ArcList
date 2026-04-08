import { getToken } from "../utils/session.js";

import { API_BASE_URL } from "../config.js";

async function searchUsers(query) {
  const token = getToken();

  const response = await fetch(
    `${API_BASE_URL}/friends/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to search users.");
  }

  return data;
}

async function getFriendsOverview() {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/friends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load friends.");
  }

  return data;
}

async function sendFriendRequest(receiverId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/friends/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiverId }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send friend request.");
  }

  return data;
}

async function respondToFriendRequest(requestId, action) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to respond to request.");
  }

  return data;
}

async function removeFriend(friendId) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}/friends/${friendId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove friend.");
  }

  return data;
}

export {
  searchUsers,
  getFriendsOverview,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
};