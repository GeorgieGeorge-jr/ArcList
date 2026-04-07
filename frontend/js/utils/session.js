const TOKEN_KEY = "arclist_token";
const USER_KEY = "arclist_user";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error("Failed to parse stored user:", error);
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

function saveSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

function updateStoredUser(patch) {
  const currentUser = getUser();

  if (!currentUser) return;

  const updatedUser = {
    ...currentUser,
    ...patch,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function logout(redirectPath = "./login.html") {
  clearSession();
  window.location.href = redirectPath;
}

export {
  getToken,
  getUser,
  isAuthenticated,
  saveSession,
  updateStoredUser,
  clearSession,
  logout,
};