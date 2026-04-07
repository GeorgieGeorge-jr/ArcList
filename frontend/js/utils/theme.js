function applyTheme(themeName = "summer-raspberry") {
  const html = document.documentElement;

  Array.from(html.classList).forEach((className) => {
    if (className.startsWith("theme-")) {
      html.classList.remove(className);
    }
  });

  html.classList.add(`theme-${themeName}`);
}

export { applyTheme };