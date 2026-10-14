"use client";

/** Prints the full page: opens collapsed disclosures and uses the light theme, then restores both. */
import { useEffect } from "react";

export default function usePrintPreparation() {
  useEffect(() => {
    const root = document.documentElement;
    let expanded: HTMLDetailsElement[] = [];
    let screenTheme: string | undefined;
    let printing = false;

    const prepare = () => {
      // Some browsers repeat beforeprint while the same print preview is open.
      if (printing) return;
      printing = true;
      expanded = [
        ...document.querySelectorAll<HTMLDetailsElement>("details:not([open])"),
      ];
      expanded.forEach((details) => (details.open = true));
      screenTheme = root.dataset.theme;
      root.dataset.theme = "light";
    };
    const restore = () => {
      if (!printing) return;
      printing = false;
      expanded.forEach((details) => (details.open = false));
      expanded = [];
      if (screenTheme === undefined) delete root.dataset.theme;
      else root.dataset.theme = screenTheme;
    };

    window.addEventListener("beforeprint", prepare);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", prepare);
      window.removeEventListener("afterprint", restore);
      restore();
    };
  }, []);
}
