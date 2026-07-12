import { getUser } from "../utils/session.js";

function getInitial(user) {
  const source = user?.display_name || user?.username || "?";
  return source.trim().charAt(0).toUpperCase();
}

function renderAvatarChip() {
  const user = getUser();
  const chips = document.querySelectorAll("[data-avatar-chip]");

  chips.forEach((chip) => {
    chip.innerHTML = "";

    if (user?.avatar_url) {
      const img = document.createElement("img");
      img.src = user.avatar_url;
      img.alt = user.display_name || user.username || "Profile";
      img.onerror = () => {
        chip.innerHTML = "";
        const initial = document.createElement("span");
        initial.className = "avatar-chip-initial";
        initial.textContent = getInitial(user);
        chip.appendChild(initial);
      };
      chip.appendChild(img);
    } else {
      const initial = document.createElement("span");
      initial.className = "avatar-chip-initial";
      initial.textContent = getInitial(user);
      chip.appendChild(initial);
    }
  });
}

export { renderAvatarChip };
