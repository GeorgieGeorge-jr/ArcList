import { isAuthenticated, getUser, logout } from "./session.js";

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = "./login.html";
    return null;
  }

  return getUser();
}

function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = "./dashboard.html";
  }
}

function bindLogoutButtons() {
  const logoutButtons = document.querySelectorAll("[data-logout]");

  logoutButtons.forEach((button) => {
    button.addEventListener("click", () => logout());
  });
}

export {
  requireAuth,
  redirectIfAuthenticated,
  bindLogoutButtons,
};