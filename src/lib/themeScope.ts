"use client";
import { createContext } from "react";
import type { Theme } from "../hooks/useTheme.js";
export const ThemeScopeContext = createContext<{
  theme: Theme;
  onThemeChange?: (theme: Theme) => void;
} | null>(null);
