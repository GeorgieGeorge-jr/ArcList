async function requestNotificationPermissionIfNeeded() {
  if (!("Notification" in window)) return "unsupported";

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  return Notification.requestPermission();
}

function sendBrowserNotification(title, body) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  new Notification(title, {
    body,
    silent: false,
  });
}

export {
  requestNotificationPermissionIfNeeded,
  sendBrowserNotification,
};