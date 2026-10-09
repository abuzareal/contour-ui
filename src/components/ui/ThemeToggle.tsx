"use client";

/** Header button that switches between the light and dark themes. */
import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";

export type ThemeToggleProps = {
  /** When false the theme switches instantly instead of animating. */
  animate: boolean;
};

export default function ThemeToggle({ animate }: ThemeToggleProps) {
  const { theme, toggle } = useTheme(animate);
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={(event) => toggle(event.currentTarget)}
    >
      <Moon className="theme-icon-moon" size={16} aria-hidden="true" />
      <Sun className="theme-icon-sun" size={17} aria-hidden="true" />
    </button>
  );
}
