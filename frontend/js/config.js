const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : "https://arclist-production.up.railway.app";

export { API_BASE_URL };