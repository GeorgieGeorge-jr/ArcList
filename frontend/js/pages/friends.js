import { requireAuth, bindLogoutButtons } from "../utils/guard.js";
import { hydrateAppShell } from "../utils/appShell.js";
import { renderNotificationBadges } from "../components/notificationBadge.js";
import {
  searchUsers,
  getFriendsOverview,
  sendFriendRequest,
  respondToFriendRequest,
  removeFriend,
} from "../api/friends.js";

requireAuth();
bindLogoutButtons();
hydrateAppShell({
  pageTitleId: "friendsPageTitle",
  pageTitleLabel: "friends",
});
renderNotificationBadges();

const friendSearchInput = document.getElementById("friendSearchInput");
const friendSearchResults = document.getElementById("friendSearchResults");

const friendsCountValue = document.getElementById("friendsCountValue");
const incomingCountValue = document.getElementById("incomingCountValue");
const outgoingCountValue = document.getElementById("outgoingCountValue");

const incomingRequestsList = document.getElementById("incomingRequestsList");
const outgoingRequestsList = document.getElementById("outgoingRequestsList");
const friendsList = document.getElementById("friendsList");

let searchTimeout = null;

function emptyCard(message) {
  return `
    <div class="friend-card">
      <p class="friend-card-copy">${message}</p>
    </div>
  `;
}

function renderSearchResults(users) {
  friendSearchResults.innerHTML = "";

  if (!users.length) {
    friendSearchResults.innerHTML = emptyCard("No matching users found yet.");
    return;
  }

  users.forEach((user) => {
    const card = document.createElement("article");
    card.className = "friend-card";

    card.innerHTML = `
      <div class="friend-card-top">
        <div>
          <h3 class="friend-card-name">${user.display_name || user.username}</h3>
          <p class="friend-card-copy">@${user.username}</p>
        </div>
        <span class="meta-pill">${user.profile_visibility}</span>
      </div>

      <div class="friend-card-actions">
        ${
          user.allow_friend_requests
            ? `<button class="btn btn-primary" data-send-request="${user.id}">Send Request</button>`
            : `<span class="meta-pill">Not accepting requests</span>`
        }
      </div>
    `;

    friendSearchResults.appendChild(card);
  });

  document.querySelectorAll("[data-send-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const receiverId = button.getAttribute("data-send-request");

      try {
        await sendFriendRequest(receiverId);
        alert("Friend request sent.");
        await loadOverview();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function renderIncomingRequests(items) {
  incomingRequestsList.innerHTML = "";

  if (!items.length) {
    incomingRequestsList.innerHTML = emptyCard("No incoming requests right now.");
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "friend-card";

    card.innerHTML = `
      <div class="friend-card-top">
        <div>
          <h3 class="friend-card-name">${item.sender_display_name || item.sender_username}</h3>
          <p class="friend-card-copy">@${item.sender_username}</p>
        </div>
        <span class="meta-pill">Pending</span>
      </div>

      <div class="friend-card-actions">
        <button class="btn btn-primary" data-accept-request="${item.id}">Accept</button>
        <button class="btn btn-secondary" data-reject-request="${item.id}">Reject</button>
      </div>
    `;

    incomingRequestsList.appendChild(card);
  });

  document.querySelectorAll("[data-accept-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.getAttribute("data-accept-request");

      try {
        await respondToFriendRequest(requestId, "accepted");
        await loadOverview();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  document.querySelectorAll("[data-reject-request]").forEach((button) => {
    button.addEventListener("click", async () => {
      const requestId = button.getAttribute("data-reject-request");

      try {
        await respondToFriendRequest(requestId, "rejected");
        await loadOverview();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

function renderOutgoingRequests(items) {
  outgoingRequestsList.innerHTML = "";

  if (!items.length) {
    outgoingRequestsList.innerHTML = emptyCard("No outgoing requests right now.");
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "friend-card";

    card.innerHTML = `
      <div class="friend-card-top">
        <div>
          <h3 class="friend-card-name">${item.receiver_display_name || item.receiver_username}</h3>
          <p class="friend-card-copy">@${item.receiver_username}</p>
        </div>
        <span class="meta-pill">Pending</span>
      </div>
    `;

    outgoingRequestsList.appendChild(card);
  });
}

function renderFriends(items) {
  friendsList.innerHTML = "";

  if (!items.length) {
    friendsList.innerHTML = emptyCard("No friends added yet.");
    return;
  }

  items.forEach((friend) => {
    const card = document.createElement("article");
    card.className = "friend-card";

    card.innerHTML = `
      <div class="friend-card-top">
        <div>
          <h3 class="friend-card-name">${friend.display_name || friend.username}</h3>
          <p class="friend-card-copy">@${friend.username}</p>
        </div>
        <span class="meta-pill">
          ${friend.allow_collaboration ? "Collaboration open" : "Collaboration off"}
        </span>
      </div>

      <div class="friend-card-actions">
        <button class="btn btn-secondary" data-remove-friend="${friend.friend_id}">Remove friend</button>
      </div>
    `;

    friendsList.appendChild(card);
  });

  document.querySelectorAll("[data-remove-friend]").forEach((button) => {
    button.addEventListener("click", async () => {
      const friendId = button.getAttribute("data-remove-friend");

      try {
        await removeFriend(friendId);
        await loadOverview();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}

async function loadOverview() {
  try {
    const result = await getFriendsOverview();
    const data = result.data;

    friendsCountValue.textContent = data.friends.length;
    incomingCountValue.textContent = data.incoming.length;
    outgoingCountValue.textContent = data.outgoing.length;

    renderIncomingRequests(data.incoming);
    renderOutgoingRequests(data.outgoing);
    renderFriends(data.friends);
    await renderNotificationBadges();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

friendSearchInput?.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  const query = friendSearchInput.value.trim();

  if (!query) {
    friendSearchResults.innerHTML = "";
    return;
  }

  searchTimeout = setTimeout(async () => {
    try {
      const result = await searchUsers(query);
      renderSearchResults(result.data || []);
    } catch (error) {
      console.error(error);
    }
  }, 300);
});

loadOverview();