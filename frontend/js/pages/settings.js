import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { getSettings, updateSettings } from "../api/settings.js";
import { updateStoredUser } from "../utils/session.js";
import { applyTheme } from "../utils/theme.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";

const user = requireAuth();
bindLogoutButtons();
renderNotificationBadges();

const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserMeta = document.getElementById("sidebarUserMeta");
const settingsPageTitle = document.getElementById("settingsPageTitle");

const settingsForm = document.getElementById("settingsForm");

const displayNameInput = document.getElementById("displayName");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const avatarUrlInput = document.getElementById("avatarUrl");

const themeInput = document.getElementById("theme");
const defaultPlanningModeInput = document.getElementById("defaultPlanningMode");
const defaultTaskDurationInput = document.getElementById("defaultTaskDuration");

const notificationsEnabledInput = document.getElementById("notificationsEnabled");
const reminderNotificationsInput = document.getElementById("reminderNotifications");
const dailyReviewNotificationsInput = document.getElementById("dailyReviewNotifications");
const collaborationNotificationsInput = document.getElementById("collaborationNotifications");

const profileVisibilityInput = document.getElementById("profileVisibility");
const allowFriendRequestsInput = document.getElementById("allowFriendRequests");
const allowCollaborationInput = document.getElementById("allowCollaboration");

const themePreviewName = document.getElementById("themePreviewName");
const themePreviewDescription = document.getElementById("themePreviewDescription");

const avatarPreviewImage = document.getElementById("avatarPreviewImage");
const avatarPreviewFallback = document.getElementById("avatarPreviewFallback");

if (user) {
  const firstName = user.display_name?.split(" ")[0] || user.username || "there";

  if (sidebarUserName) sidebarUserName.textContent = user.display_name || firstName;
  if (sidebarUserMeta) sidebarUserMeta.textContent = `@${user.username}`;
  if (settingsPageTitle) settingsPageTitle.textContent = `${firstName}'s settings`;
}

const themeLabels = {
  "summer-raspberry": "Summer Raspberry",
  "midnight-indigo": "Midnight Indigo",
  "emerald-bloom": "Emerald Bloom",
  "obsidian-sky": "Obsidian Sky",
  "amber-smoke": "Amber Smoke",
  "royal-plum": "Royal Plum",
  "ocean-noir": "Ocean Noir",
  "forest-velvet": "Forest Velvet",
};

const themeDescriptions = {
  "summer-raspberry": "Moody, rich, focused, premium.",
  "midnight-indigo": "Cool, sharp, calm, late-night operator energy.",
  "emerald-bloom": "Fresh, grounded, clean, quietly productive.",
  "obsidian-sky": "Minimal, crisp, deep, a little dangerous.",
  "amber-smoke": "Warm, thoughtful, low-light creative focus.",
  "royal-plum": "Bold, lush, expressive, elegant without shouting.",
  "ocean-noir": "Clean depth, soft contrast, calm intelligence.",
  "forest-velvet": "Dark organic tones with steady, grounded focus.",
};

function refreshAvatarPreview() {
  const avatarUrl = avatarUrlInput.value.trim();
  const displayName = displayNameInput.value.trim();
  const fallbackLetter = (displayName[0] || "A").toUpperCase();

  avatarPreviewFallback.textContent = fallbackLetter;

  if (avatarUrl) {
    avatarPreviewImage.src = avatarUrl;
    avatarPreviewImage.style.display = "block";
    avatarPreviewFallback.style.display = "none";

    avatarPreviewImage.onerror = () => {
      avatarPreviewImage.style.display = "none";
      avatarPreviewFallback.style.display = "grid";
    };
  } else {
    avatarPreviewImage.style.display = "none";
    avatarPreviewFallback.style.display = "grid";
  }
}

function refreshThemePreview() {
  const selectedTheme = themeInput.value;
  themePreviewName.textContent = themeLabels[selectedTheme] || selectedTheme;
  themePreviewDescription.textContent =
    themeDescriptions[selectedTheme] || "A custom ArcList theme.";

  applyTheme(selectedTheme);
}

async function loadSettingsPage() {
  try {
    const result = await getSettings();
    const settings = result.data;

    displayNameInput.value = settings.display_name || "";
    usernameInput.value = settings.username || "";
    emailInput.value = settings.email || "";
    avatarUrlInput.value = settings.avatar_url || "";

    themeInput.value = settings.theme || "summer-raspberry";
    defaultPlanningModeInput.value = settings.default_planning_mode || "todo";
    defaultTaskDurationInput.value = settings.default_task_duration || 30;

    notificationsEnabledInput.checked = Boolean(settings.notifications_enabled);
    reminderNotificationsInput.checked = Boolean(settings.reminder_notifications);
    dailyReviewNotificationsInput.checked = Boolean(settings.daily_review_notifications);
    collaborationNotificationsInput.checked = Boolean(settings.collaboration_notifications);

    profileVisibilityInput.value = settings.profile_visibility || "friends";
    allowFriendRequestsInput.checked = Boolean(settings.allow_friend_requests);
    allowCollaborationInput.checked = Boolean(settings.allow_collaboration);

    refreshThemePreview();
    refreshAvatarPreview();
  } catch (error) {
    alert(error.message);
  }
}

themeInput.addEventListener("change", refreshThemePreview);
avatarUrlInput.addEventListener("input", refreshAvatarPreview);
displayNameInput.addEventListener("input", refreshAvatarPreview);

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    displayName: displayNameInput.value.trim(),
    avatarUrl: avatarUrlInput.value.trim(),
    theme: themeInput.value,
    defaultPlanningMode: defaultPlanningModeInput.value,
    defaultTaskDuration: Number(defaultTaskDurationInput.value),
    notificationsEnabled: notificationsEnabledInput.checked,
    reminderNotifications: reminderNotificationsInput.checked,
    dailyReviewNotifications: dailyReviewNotificationsInput.checked,
    collaborationNotifications: collaborationNotificationsInput.checked,
    profileVisibility: profileVisibilityInput.value,
    allowFriendRequests: allowFriendRequestsInput.checked,
    allowCollaboration: allowCollaborationInput.checked,
  };

  try {
    const result = await updateSettings(payload);
    const updated = result.data;

    updateStoredUser({
      display_name: updated.display_name,
      username: updated.username,
      email: updated.email,
      theme: updated.theme,
      avatar_url: updated.avatar_url,
    });

    sidebarUserName.textContent = updated.display_name;
    sidebarUserMeta.textContent = `@${updated.username}`;

    refreshThemePreview();
    refreshAvatarPreview();

    alert("Settings saved successfully.");
  } catch (error) {
    alert(error.message);
  }
});

loadSettingsPage();