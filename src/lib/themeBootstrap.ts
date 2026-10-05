/** Pre-paint theme script, injected inline into every HTML page by vite.config.ts to avoid a light/dark flash. */
// Explicit extension: this file is also loaded by vite.config.ts.
import { storageKeys } from "./storage.js";

/** Browser UI colours; keep in sync with `--bg` in styles/tokens.css. */
export const themeColors = {
  light: "#f2f3ee",
  dark: "#0f100d",
} as const;

export const themeBootstrapScript = `(function () {
  var theme = "light";
  try {
    var stored = localStorage.getItem("${storageKeys.theme}");
    if (stored === "light" || stored === "dark") theme = stored;
    else if (matchMedia("(prefers-color-scheme: dark)").matches) theme = "dark";
  } catch (error) {}
  document.documentElement.dataset.theme = theme;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "${themeColors.dark}" : "${themeColors.light}");
})();`;
