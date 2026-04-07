const { findFriendship } = require("../models/friendModel");
const {
  getConversationList,
  getMessagesBetweenUsers,
  createMessage,
  markConversationAsRead,
} = require("../models/messageModel");

const { createNotification } = require("../models/notificationModel");

async function getUserConversations(userId) {
  return getConversationList(userId);
}

async function getConversation(userId, friendId) {
  const normalizedFriendId = Number(friendId);

  const friendship = await findFriendship(userId, normalizedFriendId);
  if (!friendship) {
    throw new Error("You can only message users who are your friends.");
  }

  await markConversationAsRead(userId, normalizedFriendId);

  return getMessagesBetweenUsers(userId, normalizedFriendId);
}

async function sendMessage(userId, receiverId, body) {
  const normalizedReceiverId = Number(receiverId);

  if (!normalizedReceiverId) {
    throw new Error("Receiver ID is required.");
  }

  if (!body || !body.trim()) {
    throw new Error("Message cannot be empty.");
  }

  const friendship = await findFriendship(userId, normalizedReceiverId);
  if (!friendship) {
    throw new Error("You can only message users who are your friends.");
  }

  const message = await createMessage(userId, normalizedReceiverId, body.trim());

  await createNotification({
    userId: normalizedReceiverId,
    type: "system",
    title: "New message",
    message: "You received a new message from a friend.",
    scheduledFor: new Date(),
  });

  return message;
}

module.exports = {
  getUserConversations,
  getConversation,
  sendMessage,
};