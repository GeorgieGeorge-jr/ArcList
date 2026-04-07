const {
  searchForUsers,
  sendFriendRequest,
  getFriendOverview,
  respondToFriendRequest,
  removeFriend,
} = require("../services/friendService");

async function searchUsersController(req, res) {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    const users = await searchForUsers(userId, q);

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("searchUsersController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to search users.",
    });
  }
}

async function sendFriendRequestController(req, res) {
  try {
    const userId = req.user.id;
    const { receiverId } = req.body;

    const request = await sendFriendRequest(userId, receiverId);

    return res.status(201).json({
      success: true,
      message: "Friend request sent.",
      data: request,
    });
  } catch (error) {
    console.error("sendFriendRequestController error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send friend request.",
    });
  }
}

async function getFriendOverviewController(req, res) {
  try {
    const userId = req.user.id;

    const overview = await getFriendOverview(userId);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("getFriendOverviewController error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load friends overview.",
    });
  }
}

async function respondToFriendRequestController(req, res) {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body;

    const updated = await respondToFriendRequest(userId, requestId, action);

    return res.status(200).json({
      success: true,
      message: `Friend request ${action}.`,
      data: updated,
    });
  } catch (error) {
    console.error("respondToFriendRequestController error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to respond to friend request.",
    });
  }
}

async function removeFriendController(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    await removeFriend(userId, friendId);

    return res.status(200).json({
      success: true,
      message: "Friend removed successfully.",
    });
  } catch (error) {
    console.error("removeFriendController error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove friend.",
    });
  }
}

module.exports = {
  searchUsersController,
  sendFriendRequestController,
  getFriendOverviewController,
  respondToFriendRequestController,
  removeFriendController,
};