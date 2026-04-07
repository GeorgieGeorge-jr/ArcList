const {
  getUserSettingsById,
  updateUserSettingsById,
} = require("../models/userSettingsModel");

const ALLOWED_THEMES = [
  "summer-raspberry",
  "midnight-indigo",
  "emerald-bloom",
  "obsidian-sky",
  "amber-smoke",
  "royal-plum",
  "ocean-noir",
  "forest-velvet",
];

const ALLOWED_PLANNING_MODES = ["todo", "timetable"];
const ALLOWED_PROFILE_VISIBILITY = ["private", "friends", "public"];

async function fetchUserSettings(userId) {
  return getUserSettingsById(userId);
}

async function saveUserSettings(userId, payload) {
  const displayName = payload.displayName?.trim();
  const avatarUrl = payload.avatarUrl?.trim() || null;
  const theme = payload.theme?.trim();
  const defaultPlanningMode = payload.defaultPlanningMode?.trim();
  const defaultTaskDuration = Number(payload.defaultTaskDuration);

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  if (!ALLOWED_THEMES.includes(theme)) {
    throw new Error("Invalid theme selected.");
  }

  if (!ALLOWED_PLANNING_MODES.includes(defaultPlanningMode)) {
    throw new Error("Invalid planning mode selected.");
  }

  if (!Number.isFinite(defaultTaskDuration) || defaultTaskDuration < 1) {
    throw new Error("Default task duration must be at least 1 minute.");
  }

  const profileVisibility = payload.profileVisibility?.trim();

  if (!ALLOWED_PROFILE_VISIBILITY.includes(profileVisibility)) {
    throw new Error("Invalid profile visibility selected.");
  }

  return updateUserSettingsById(userId, {
    displayName,
    avatarUrl,
    theme,
    defaultPlanningMode,
    defaultTaskDuration,
    notificationsEnabled: Boolean(payload.notificationsEnabled),
    reminderNotifications: Boolean(payload.reminderNotifications),
    dailyReviewNotifications: Boolean(payload.dailyReviewNotifications),
    collaborationNotifications: Boolean(payload.collaborationNotifications),
    profileVisibility,
    allowFriendRequests: Boolean(payload.allowFriendRequests),
    allowCollaboration: Boolean(payload.allowCollaboration),
  });
}

module.exports = {
  fetchUserSettings,
  saveUserSettings,
};