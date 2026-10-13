import { componentClasses } from "./componentClasses.js";
/** Builds a className string from optional parts, skipping falsy values. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

/** Prefixed hooks alongside compatibility classes; never use this for IDs or ARIA references. */
export const ccx = (...parts: (string | false | null | undefined)[]) => {
  const names = cx(...parts)
    .split(/\s+/)
    .filter(Boolean);
  return [
    ...new Set([
      ...names,
      ...names
        .filter((name) => componentClasses.has(name))
        .map((name) => `contour-${name}`),
    ]),
  ].join(" ");
};

export type ButtonVariant =
  "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Button classes, shared so anchors can look like buttons without duplicating styles. */
export const buttonClassName = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) => ccx("button", `button-${variant}`, `button-${size}`, className);
