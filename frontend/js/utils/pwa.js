// PWA install experience: service worker registration + a tasteful,
// dismissible install suggestion that appears after a couple of visits.
//
// iOS Safari has no `beforeinstallprompt` API at all — there is no way to
// trigger the install programmatically. The only thing we can do is show
// our own instructional banner ("tap Share, then Add to Home Screen").
// Android/Chrome DOES support beforeinstallprompt, so there we can offer
// a real one-tap install button instead.

const DISMISSED_KEY = "arclist_pwa_dismissed";
const INSTALLED_KEY = "arclist_pwa_installed";
const VISIT_COUNT_KEY = "arclist_pwa_visit_count";
const LAST_VISIT_KEY = "arclist_pwa_last_visit_date";
const MIN_VISITS_BEFORE_PROMPT = 2;

let deferredInstallPrompt = null;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function hasDismissed() {
  return localStorage.getItem(DISMISSED_KEY) === "true";
}

function markDismissed() {
  localStorage.setItem(DISMISSED_KEY, "true");
}

function markInstalled() {
  localStorage.setItem(INSTALLED_KEY, "true");
}

function isMarkedInstalled() {
  return localStorage.getItem(INSTALLED_KEY) === "true";
}

// Counts distinct calendar days the app has been opened while signed in.
// A rough, zero-backend proxy for "this person is actually using ArcList",
// so we don't suggest installing on someone's very first visit.
function recordVisitAndGetCount() {
  const today = new Date().toISOString().slice(0, 10);
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
  let count = Number(localStorage.getItem(VISIT_COUNT_KEY) || "0");

  if (lastVisit !== today) {
    count += 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(count));
    localStorage.setItem(LAST_VISIT_KEY, today);
  }

  return count;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

function buildBanner({ onInstallClick, onDismiss, isIosDevice }) {
  const banner = document.createElement("div");
  banner.className = "pwa-install-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Install ArcList");

  banner.innerHTML = isIosDevice
    ? `
      <div class="pwa-install-icon">
        <img src="/assets/icons/icon-192.png" alt="" width="40" height="40">
      </div>
      <div class="pwa-install-copy">
        <strong>Add ArcList to your Home Screen</strong>
        <span>Tap <span class="pwa-share-glyph" aria-hidden="true">⬆</span> Share, then "Add to Home Screen" for the full app feel.</span>
      </div>
      <button type="button" class="pwa-install-dismiss" aria-label="Dismiss">&times;</button>
    `
    : `
      <div class="pwa-install-icon">
        <img src="/assets/icons/icon-192.png" alt="" width="40" height="40">
      </div>
      <div class="pwa-install-copy">
        <strong>Install ArcList</strong>
        <span>Get the full-screen, app-like experience on your device.</span>
      </div>
      <button type="button" class="pwa-install-cta">Install</button>
      <button type="button" class="pwa-install-dismiss" aria-label="Dismiss">&times;</button>
    `;

  banner.querySelector(".pwa-install-dismiss").addEventListener("click", () => {
    banner.remove();
    onDismiss();
  });

  const cta = banner.querySelector(".pwa-install-cta");
  if (cta) {
    cta.addEventListener("click", () => {
      onInstallClick();
      banner.remove();
    });
  }

  return banner;
}

function showInstallBanner() {
  if (document.querySelector(".pwa-install-banner")) return;

  const iosDevice = isIos();

  const banner = buildBanner({
    isIosDevice: iosDevice,
    onDismiss: markDismissed,
    onInstallClick: async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;
      if (outcome === "accepted") markInstalled();
      deferredInstallPrompt = null;
    },
  });

  document.body.appendChild(banner);

  // Slide/fade in on next frame for a tasteful entrance rather than a pop-in.
  requestAnimationFrame(() => banner.classList.add("is-visible"));
}

function maybeSuggestInstall() {
  if (isStandalone()) {
    markInstalled();
    return;
  }
  if (isMarkedInstalled() || hasDismissed()) return;

  const visits = recordVisitAndGetCount();
  if (visits < MIN_VISITS_BEFORE_PROMPT) return;

  const iosDevice = isIos();

  if (iosDevice) {
    // No install API on iOS — just show the instructional banner.
    showInstallBanner();
    return;
  }

  // Android/Chrome: wait for the real browser install signal, then show
  // our own banner wired to it (nicer and more consistent than the raw
  // browser-native mini-infobar).
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    showInstallBanner();
  });

  window.addEventListener("appinstalled", () => {
    markInstalled();
    const existing = document.querySelector(".pwa-install-banner");
    if (existing) existing.remove();
  });
}

// Call on every page so the whole site gets offline caching.
function initServiceWorker() {
  registerServiceWorker();
}

// Call only on authenticated app pages (not marketing/login/register).
function initInstallPrompt() {
  maybeSuggestInstall();
}

export { initServiceWorker, initInstallPrompt };
