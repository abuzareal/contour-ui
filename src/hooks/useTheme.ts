/** Light/dark theme state: persisted choice, system fallback, and the animated switch. */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { readStorage, storageKeys, writeStorage } from "../lib/storage.js";
import { themeColors } from "../lib/themeBootstrap.js";

export type Theme = "light" | "dark";

const revealDuration = 1100;
const revealEasing = "cubic-bezier(0.76, 0, 0.24, 1)";

const readTheme = (): Theme =>
  typeof document !== "undefined" &&
  document.documentElement.dataset.theme === "dark"
    ? "dark"
    : "light";

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", themeColors[theme]);
  window.dispatchEvent(new Event("contour-theme-change"));
}

/** Grows the new theme as a circle from `origin` while the old page recedes. */
function animateReveal(transition: ViewTransition, origin: HTMLElement) {
  const bounds = origin.getBoundingClientRect();
  const x = bounds.left + bounds.width / 2;
  const y = bounds.top + bounds.height / 2;
  const radius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  const timing = { duration: revealDuration, easing: revealEasing };
  transition.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        { ...timing, pseudoElement: "::view-transition-new(root)" },
      );
      document.documentElement.animate(
        { transform: ["scale(1)", "scale(0.965)"], opacity: [1, 0.55] },
        { ...timing, pseudoElement: "::view-transition-old(root)" },
      );
    })
    .catch(() => {});
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKeys.theme && event.key !== null) return;
    const stored = readStorage("local", storageKeys.theme);
    applyTheme(
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    );
  };
  window.addEventListener("contour-theme-change", onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    observer.disconnect();
    window.removeEventListener("contour-theme-change", onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export default function useTheme(animate = true) {
  const theme = useSyncExternalStore(
    subscribe,
    readTheme,
    () => "light" as Theme,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const followSystem = () => {
      if (readStorage("local", storageKeys.theme) !== null) return;
      const next = media.matches ? "dark" : "light";
      applyTheme(next);
    };
    media.addEventListener("change", followSystem);
    return () => media.removeEventListener("change", followSystem);
  }, []);

  const toggle = useCallback(
    (origin: HTMLElement) => {
      const next: Theme = readTheme() === "dark" ? "light" : "dark";
      writeStorage("local", storageKeys.theme, next);
      const commit = () => {
        flushSync(() => applyTheme(next));
      };
      if (
        !animate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        commit();
        return;
      }
      if (typeof document.startViewTransition !== "function") {
        const root = document.documentElement;
        root.classList.add("theme-fading");
        commit();
        window.setTimeout(() => root.classList.remove("theme-fading"), 500);
        return;
      }
      animateReveal(document.startViewTransition(commit), origin);
    },
    [animate],
  );

  return { theme, toggle };
}
