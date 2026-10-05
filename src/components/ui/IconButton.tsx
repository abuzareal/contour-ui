/** Circular icon-only button (the portfolio's source/copy button), with a required accessible label. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/classNames.js";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  variant?: "outline" | "solid" | "accent";
  size?: "sm" | "md" | "lg";
  /** Rotates the icon 45deg on hover, as on the project source links. */
  spin?: boolean;
};

export default function IconButton({
  label,
  children,
  variant = "outline",
  size = "md",
  spin = false,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      aria-label={label}
      title={rest.title ?? label}
      className={cx(
        "icon-button",
        `icon-button-${variant}`,
        `icon-button-${size}`,
        spin && "icon-button-spin",
        className,
      )}
    >
      {children}
    </button>
  );
}
