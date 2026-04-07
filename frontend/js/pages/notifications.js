import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { hydrateAppShell } from "../utils/appShell.js";
import {
  getNotifications,
  generateNotificationsNow,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications.js";
import { respondToFriendRequest } from "../api/friends.js";
import {
  requestNotificationPermissionIfNeeded,
  sendBrowserNotification,
} from "../utils/browserNotifications.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";

requireAuth();
bindLogoutButtons();
hydrateAppShell({
  pageTitleId: "notificationsPageTitle",
  pageTitleLabel: "notifications",
});

const notificationsEmptyState = document.getElementById("notificationsEmptyState");
const notificationsList = document.getElementById("notificationsList");
const markAllReadBtn = document.getElementById("markAllReadBtn");
const generateNotificationsBtn = document.getElementById("generateNotificationsBtn");

let allNotifications = [];
const shownNotificationIds = new Set();

function formatDateTime(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderNotifications() {
  notificationsList.innerHTML = "";

  if (!allNotifications.length) {
    notificationsEmptyState.style.display = "block";
    notificationsList.style.display = "none";
    return;
  }

  notificationsEmptyState.style.display = "none";
  notificationsList.style.display = "grid";

  allNotifications.forEach((notification) => {
    const card = document.createElement("article");
    card.className = `notification-card ${notification.is_read ? "" : "unread"}`;

    const friendRequestActions =
      notification.related_request_id && notification.title === "New friend request"
        ? `
          <button class="btn btn-primary" data-accept-request="${notification.related_request_id}">Accept</button>
          <button class="btn btn-secondary" data-reject-request="${notification.related_request_id}">Decline</button>
        `
        : "";

    card.innerHTML = `
      <div class="notification-card-top">
        <div>
          <h3 class="notification-card-title">${notification.title}</h3>
          <span class="meta-pill">${notification.type.replace("_", " ")}</span>
        </div>
        <span class="meta-pill">${formatDateTime(notification.scheduled_for || notification.created_at)}</span>
      </div>

      <p class="notification-card-copy">${notification.message}</p>

      <div class="notification-card-actions">
        ${friendRequestActions}
        ${
          notification.is_read
            ? `<span class="meta-pill">Read</span>`
            : `<button class="btn btn-secondary" data-read-notification="${notification.id}">Mark as read</button>`
        }
      </div>
    `;

    notificationsList.appendChild(card);
  });

  document.querySelectorAll("[data-read-notification]").forEach((button) => {
    button.addEventListener("click", async () => {
      const notificationId = button.getAttribute("data-read-notification");

      try {
        await markNotificationRead(notificationId);
        await loadNotifications();
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  });

  document.querySelectorAll("[data-accept-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.getAttribute("data-accept-request");

      try {
        await respondToFriendRequest(requestId, "accepted");
        await loadNotifications();
        alert("Friend request accepted.");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  });

  document.querySelectorAll("[data-reject-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.getAttribute("data-reject-request");

      try {
        await respondToFriendRequest(requestId, "rejected");
        await loadNotifications();
        alert("Friend request declined.");
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    });
  });
}

async function loadNotifications() {
  try {
    await requestNotificationPermissionIfNeeded();

    const result = await getNotifications();
    allNotifications = result.data || [];

    allNotifications.forEach((notification) => {
      if (!notification.is_read && !shownNotificationIds.has(notification.id)) {
        sendBrowserNotification(notification.title, notification.message);
        shownNotificationIds.add(notification.id);
      }
    });

    renderNotifications();
    await renderNotificationBadges();
  } catch (error) {
    console.error("Notifications load failed:", error);
    alert(error.message);
  }
}

generateNotificationsBtn?.addEventListener("click", async () => {
  try {
    await generateNotificationsNow();
    await loadNotifications();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

markAllReadBtn?.addEventListener("click", async () => {
  try {
    await markAllNotificationsRead();
    await loadNotifications();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
});

setInterval(() => {
  loadNotifications();
}, 30000);

loadNotifications();