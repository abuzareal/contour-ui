"use client";

import { ccx } from "../../lib/classNames.js";

/** Header button that switches between the light and dark themes. */
import { forwardRef } from "react";
import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme.js";

export type ThemeToggleProps = {
  /** When false the theme switches instantly instead of animating. */
  animate: boolean;
  darkLabel?: string;
  lightTitle?: string;
  darkTitle?: string;
};

const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
  function ThemeToggle(
    {
      animate,
      darkLabel = "Dark theme",
      lightTitle = "Switch to light theme",
      darkTitle = "Switch to dark theme",
    }: ThemeToggleProps,
    ref,
  ) {
    const { theme, toggle, canToggle } = useTheme(animate);
    const dark = theme === "dark";

    return (
      <button
        ref={ref}
        type="button"
        className={ccx("theme-toggle")}
        aria-label={darkLabel}
        aria-pressed={dark}
        disabled={!canToggle}
        title={dark ? lightTitle : darkTitle}
        onClick={(event) => toggle(event.currentTarget)}
      >
        <Moon className={ccx("theme-icon-moon")} size={16} aria-hidden="true" />
        <Sun className={ccx("theme-icon-sun")} size={17} aria-hidden="true" />
      </button>
    );
  },
);
export default ThemeToggle;
