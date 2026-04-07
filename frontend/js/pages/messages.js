import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { hydrateAppShell } from "../utils/appShell.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";
import {
  getConversations,
  getConversation,
  sendMessage,
} from "../api/messages.js";

const currentUser = requireAuth();
bindLogoutButtons();
hydrateAppShell({
  pageTitleId: "messagesPageTitle",
  pageTitleLabel: "messages",
});
renderNotificationBadges();

const conversationsList = document.getElementById("conversationsList");
const activeChatTitle = document.getElementById("activeChatTitle");
const activeChatSubtitle = document.getElementById("activeChatSubtitle");
const messagesThread = document.getElementById("messagesThread");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");

let conversations = [];
let activeFriendId = null;
let activeConversation = [];

function formatDateTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function renderConversations() {
  conversationsList.innerHTML = "";

  if (!conversations.length) {
    conversationsList.innerHTML = `
      <div class="friend-card">
        <p class="friend-card-copy">No conversations yet. Add friends first, then messages can begin.</p>
      </div>
    `;
    return;
  }

  conversations.forEach((conversation) => {
    const card = document.createElement("article");
    card.className = `conversation-card ${Number(activeFriendId) === Number(conversation.friend_id) ? "active" : ""}`;

    card.innerHTML = `
      <div class="friend-card-top">
        <div>
          <h3 class="friend-card-name">${conversation.display_name || conversation.username}</h3>
          <p class="friend-card-copy">@${conversation.username}</p>
        </div>
        ${
          conversation.unread_count > 0
            ? `<span class="notification-badge" style="display:inline-flex;">${conversation.unread_count}</span>`
            : ""
        }
      </div>

      <p class="friend-card-copy" style="margin-top: 0.6rem;">
        ${conversation.last_message_body || "No messages yet."}
      </p>
    `;

    card.addEventListener("click", async () => {
      activeFriendId = conversation.friend_id;
      await loadConversation();
      renderConversations();
    });

    conversationsList.appendChild(card);
  });
}

function renderMessages() {
  messagesThread.innerHTML = "";

  if (!activeConversation.length) {
    messagesThread.classList.add("empty-state");
    messagesThread.innerHTML = `
      <p class="section-copy">No messages in this conversation yet. Say hello first.</p>
    `;
    return;
  }

  messagesThread.classList.remove("empty-state");

  activeConversation.forEach((message) => {
    const bubble = document.createElement("div");
    const isSentByCurrentUser = Number(message.sender_id) === Number(currentUser.id);

    bubble.className = `message-bubble ${isSentByCurrentUser ? "sent" : "received"}`;
    bubble.innerHTML = `
      <div>${message.body}</div>
      <span class="message-meta">${formatDateTime(message.created_at)}</span>
    `;

    messagesThread.appendChild(bubble);
  });

  messagesThread.style.scrollBehavior = "smooth";
  messagesThread.scrollTop = messagesThread.scrollHeight;
}

async function loadConversations() {
  try {
    const result = await getConversations();
    conversations = result.data || [];
    renderConversations();

    if (!activeFriendId && conversations.length) {
      activeFriendId = conversations[0].friend_id;
      await loadConversation();
      renderConversations();
    }
  } catch (error) {
    alert(error.message);
  }
}

async function loadConversation() {
  if (!activeFriendId) return;

  try {
    const result = await getConversation(activeFriendId);
    activeConversation = result.data || [];

    const activeFriend = conversations.find(
      (conversation) => Number(conversation.friend_id) === Number(activeFriendId)
    );

    activeChatTitle.textContent = activeFriend
      ? activeFriend.display_name || activeFriend.username
      : "Conversation";

    activeChatSubtitle.textContent = activeFriend
      ? `@${activeFriend.username}`
      : "Chat";

    renderMessages();
    await loadConversations();
    await renderNotificationBadges();
  } catch (error) {
    alert(error.message);
  }
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!activeFriendId) {
    alert("Select a conversation first.");
    return;
  }

  const body = messageInput.value.trim();

  if (!body) {
    return;
  }

  try {
    await sendMessage(activeFriendId, body);
    messageInput.value = "";
    await loadConversation();
  } catch (error) {
    alert(error.message);
  }
});

setInterval(() => {
  if (activeFriendId) {
    loadConversation();
  } else {
    loadConversations();
  }
}, 2000);

// Load immediately
initMessagesPage();

// Then keep it fresh
setInterval(async () => {
  await loadConversations();
  if (activeFriendId) {
    await loadConversation(activeFriendId);
  }
}, 8000);