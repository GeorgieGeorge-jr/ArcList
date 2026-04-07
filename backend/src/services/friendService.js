const {
  searchUsers,
  findUserById,
  findFriendRequest,
  createFriendRequest,
  updateFriendRequestStatus,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  createFriendPair,
  findFriendship,
  getFriendsByUserId,
  removeFriendPair,
  getFriendRequestById,
} = require("../models/friendModel");
const { createNotification } = require("../models/notificationModel");

async function searchForUsers(currentUserId, query) {
  if (!query || !query.trim()) {
    return [];
  }

  return searchUsers(query.trim(), currentUserId);
}

async function sendFriendRequest(currentUserId, receiverId) {
  const normalizedReceiverId = Number(receiverId);

  if (!normalizedReceiverId) {
    throw new Error("Receiver ID is required.");
  }

  if (currentUserId === normalizedReceiverId) {
    throw new Error("You cannot send a friend request to yourself.");
  }

  const receiver = await findUserById(normalizedReceiverId);
  if (!receiver) {
    throw new Error("User not found.");
  }

  if (!receiver.allow_friend_requests) {
    throw new Error("This user is not accepting friend requests.");
  }

  const existingFriendship = await findFriendship(currentUserId, normalizedReceiverId);
  if (existingFriendship) {
    throw new Error("You are already friends.");
  }

  const existingForward = await findFriendRequest(currentUserId, normalizedReceiverId);
  if (existingForward && existingForward.status === "pending") {
    throw new Error("Friend request already sent.");
  }

  const existingReverse = await findFriendRequest(normalizedReceiverId, currentUserId);
  if (existingReverse && existingReverse.status === "pending") {
    throw new Error("This user has already sent you a friend request.");
  }

  const request = await createFriendRequest(currentUserId, normalizedReceiverId);

  await createNotification({
    userId: normalizedReceiverId,
    type: "system",
    title: "New friend request",
    message: "Someone sent you a friend request.",
    scheduledFor: new Date(),
  });

  return request;
}

async function getFriendOverview(userId) {
  const [incoming, outgoing, friends] = await Promise.all([
    getIncomingFriendRequests(userId),
    getOutgoingFriendRequests(userId),
    getFriendsByUserId(userId),
  ]);

  return { incoming, outgoing, friends };
}

async function respondToFriendRequest(currentUserId, requestId, action) {
  const request = await getFriendRequestById(Number(requestId));

  if (!request) {
    throw new Error("Friend request not found.");
  }

  if (request.receiver_id !== currentUserId) {
    throw new Error("You cannot respond to this request.");
  }

  if (request.status !== "pending") {
    throw new Error("This request has already been handled.");
  }

  if (!["accepted", "rejected"].includes(action)) {
    throw new Error("Invalid action.");
  }

  const updatedRequest = await updateFriendRequestStatus(request.id, action);

  if (action === "accepted") {
    await createFriendPair(request.sender_id, request.receiver_id);

    await createNotification({
      userId: request.sender_id,
      type: "system",
      title: "Friend request accepted",
      message: "Your friend request was accepted.",
      scheduledFor: new Date(),
    });
  }

  return updatedRequest;
}

async function removeFriend(userId, friendId) {
  const normalizedFriendId = Number(friendId);

  if (!normalizedFriendId) {
    throw new Error("Friend ID is required.");
  }

  const existingFriendship = await findFriendship(userId, normalizedFriendId);
  if (!existingFriendship) {
    throw new Error("Friendship not found.");
  }

  await removeFriendPair(userId, normalizedFriendId);

  return true;
}

module.exports = {
  searchForUsers,
  sendFriendRequest,
  getFriendOverview,
  respondToFriendRequest,
  removeFriend,
};