"use client";
import { forwardRef, useMemo } from "react";
import type { HTMLAttributes } from "react";
import type { Theme } from "../../hooks/useTheme.js";
import { ThemeScopeContext } from "../../lib/themeScope.js";
import { cx } from "../../lib/classNames.js";
export type ThemeScopeProps = HTMLAttributes<HTMLDivElement> & {
  theme: Theme;
  /** Caller owns persistence; omitting this makes embedded theme controls read-only. */
  onThemeChange?: (theme: Theme) => void;
};
const ThemeScope = forwardRef<HTMLDivElement, ThemeScopeProps>(
  function ThemeScope(
    { theme, onThemeChange, className, children, ...rest },
    ref,
  ) {
    const context = useMemo(
      () => ({ theme, onThemeChange }),
      [theme, onThemeChange],
    );
    return (
      <ThemeScopeContext.Provider value={context}>
        <div
          {...rest}
          ref={ref}
          data-contour-theme={theme}
          className={cx("contour-root", className)}
        >
          {children}
        </div>
      </ThemeScopeContext.Provider>
    );
  },
);
export default ThemeScope;
