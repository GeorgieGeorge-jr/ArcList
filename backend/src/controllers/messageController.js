const {
  getUserConversations,
  getConversation,
  sendMessage,
} = require("../services/messageService");

async function getConversationsController(req, res) {
  try {
    const userId = req.user.id;
    const conversations = await getUserConversations(userId);

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error); // 👈 ADD THIS

    return res.status(500).json({
      success: false,
      message: "Failed to load conversations.",
    });
  }
}

async function getConversationController(req, res) {
  try {
    const userId = req.user.id;
    const { friendId } = req.params;

    const messages = await getConversation(userId, friendId);

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to load conversation.",
    });
  }
}

async function sendMessageController(req, res) {
  try {
    const userId = req.user.id;
    const { receiverId, body } = req.body;

    const message = await sendMessage(userId, receiverId, body);

    return res.status(201).json({
      success: true,
      message: "Message sent.",
      data: message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to send message.",
    });
  }
}

module.exports = {
  getConversationsController,
  getConversationController,
  sendMessageController,
};