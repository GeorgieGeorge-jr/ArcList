const {
  fetchUserSettings,
  saveUserSettings,
} = require("../services/userSettingsService");

async function getSettings(req, res) {
  try {
    const userId = req.user.id;
    const settings = await fetchUserSettings(userId);

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to load settings.",
    });
  }
}

async function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const updatedSettings = await saveUserSettings(userId, req.body);

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully.",
      data: updatedSettings,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update settings.",
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};