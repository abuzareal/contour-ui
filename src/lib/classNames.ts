/** Builds a className string from optional parts, skipping falsy values. */
export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export type ButtonVariant =
  "primary" | "accent" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/** Button classes, shared so anchors can look like buttons without duplicating styles. */
export const buttonClassName = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) => cx("button", `button-${variant}`, `button-${size}`, className);
