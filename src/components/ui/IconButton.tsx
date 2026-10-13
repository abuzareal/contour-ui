"use client";

/** Circular icon-only button (the portfolio's source/copy button), with a required accessible label. */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ccx } from "../../lib/classNames.js";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
  variant?: "outline" | "solid" | "accent";
  size?: "sm" | "md" | "lg";
  /** Rotates the icon 45deg on hover, as on the project source links. */
  spin?: boolean;
};

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      children,
      variant = "outline",
      size = "md",
      spin = false,
      className,
      type = "button",
      ...rest
    }: IconButtonProps,
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...rest}
        type={type}
        aria-label={label}
        title={rest.title ?? label}
        className={ccx(
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
  },
);
export default IconButton;
