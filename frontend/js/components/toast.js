function showToast(message, type = "error") {
  let container = document.getElementById("arclist-toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "arclist-toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("is-visible"));

  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

export { showToast };
