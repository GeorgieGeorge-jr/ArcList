const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5050/api"
    : `${window.location.origin}/api`;

export { API_BASE_URL };
