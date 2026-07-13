import { getUser } from "./session.js";
import { applyTheme } from "./theme.js";

function hydrateAppShell(options = {}) {
  const user = getUser();

  if (!user) {
    return null;
  }

  applyTheme(user.theme || "summer-raspberry");

  const sidebarUserName = document.getElementById("sidebarUserName");
  const sidebarUserMeta = document.getElementById("sidebarUserMeta");

  const firstName = user.display_name?.split(" ")[0] || user.username || "there";

  if (sidebarUserName) {
    sidebarUserName.textContent = user.display_name || firstName;
  }

  if (sidebarUserMeta) {
    sidebarUserMeta.textContent = `@${user.username}`;
  }

  if (options.pageTitleId) {
    const titleEl = document.getElementById(options.pageTitleId);
    if (titleEl) {
      titleEl.textContent = `${firstName}'s ${options.pageTitleLabel || "page"}`;
    }
  }

  return user;
}

export { hydrateAppShell };