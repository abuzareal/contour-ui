/** Compact mono label for status and metadata; tones follow the status palette. */
import type { ReactNode } from "react";
import { cx } from "../../lib/classNames.js";

export type BadgeTone =
  "accent" | "neutral" | "invert" | "success" | "info" | "warning" | "danger";

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  /** Leading status dot. */
  dot?: boolean;
  icon?: ReactNode;
};

export default function Badge({
  children,
  tone = "accent",
  dot = false,
  icon,
}: BadgeProps) {
  return (
    <span className={cx("badge mono", `badge-${tone}`)}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {icon}
      {children}
    </span>
  );
}
