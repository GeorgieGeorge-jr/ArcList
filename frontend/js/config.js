// IMPORTANT: your frontend (Netlify) and backend (Render) are on different
// domains, so this MUST be the backend's actual origin — it can never be
// derived from window.location.origin (that's the frontend's own domain).
const RENDER_BACKEND_URL = "https://arclist-api.onrender.com/api";

const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocalHost
  ? "http://localhost:5050/api"
  : "https://arclist-api.onrender.com/api";

export { API_BASE_URL };
