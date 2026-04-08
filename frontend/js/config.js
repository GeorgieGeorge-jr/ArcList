const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://YOUR-RAILWAY-URL.up.railway.app/api";

export { API_BASE_URL };