"use client";
import { ccx } from "../../lib/classNames.js";

/** Pill button in four emphasis levels and three sizes, with loading and icon slots. */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  loadingLabel?: string;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant,
    size,
    icon,
    leadingIcon,
    loading = false,
    loadingLabel = "Loading",
    disabled,
    className,
    children,
    type = "button",
    ...rest
  }: ButtonProps,
  ref,
) {
  return (
    <button
      ref={ref}
      {...rest}
      type={type}
      className={buttonClassName(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner size="sm" label={loadingLabel} /> : leadingIcon}
      <span>{children}</span>
      {icon && <span className={ccx("button-icon")}>{icon}</span>}
    </button>
  );
});
export default Button;
