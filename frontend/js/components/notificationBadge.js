import { getNotificationSummary } from "../api/notifications.js";

async function renderNotificationBadges() {
  const badgeTargets = document.querySelectorAll("[data-notification-badge]");

  if (!badgeTargets.length) return;

  try {
    const result = await getNotificationSummary();
    const unreadCount = result.data?.unreadCount || 0;

    badgeTargets.forEach((target) => {
      if (unreadCount > 0) {
        target.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
        target.style.display = "inline-flex";
      } else {
        target.style.display = "none";
      }
    });
  } catch (error) {
    console.error("Failed to render notification badges:", error);
  }
}

export { renderNotificationBadges };