"use client";

/** Prints the full page: opens collapsed disclosures and uses the light theme, then restores both. */
import { useEffect } from "react";

export default function usePrintPreparation() {
  useEffect(() => {
    const root = document.documentElement;
    let expanded: HTMLDetailsElement[] = [];
    let screenTheme: string | undefined;

    const prepare = () => {
      expanded = [
        ...document.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
      ];
      expanded.forEach((details) => (details.open = true));
      screenTheme = root.dataset.theme;
      root.dataset.theme = "light";
    };
    const restore = () => {
      expanded.forEach((details) => (details.open = false));
      expanded = [];
      if (screenTheme) root.dataset.theme = screenTheme;
    };

    window.addEventListener("beforeprint", prepare);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", prepare);
      window.removeEventListener("afterprint", restore);
    };
  }, []);
}
