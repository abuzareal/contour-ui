/** Pill button in four emphasis levels and three sizes, with loading and icon slots. */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "../../lib/classNames.js";
import Spinner from "./Spinner.js";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon placed after the label; it nudges forward on hover. */
  icon?: ReactNode;
  leadingIcon?: ReactNode;
  loading?: boolean;
};

export default function Button({
  variant,
  size,
  icon,
  leadingIcon,
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={buttonClassName(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner size="sm" label="Loading" /> : leadingIcon}
      <span>{children}</span>
      {icon && <span className="button-icon">{icon}</span>}
    </button>
  );
}
