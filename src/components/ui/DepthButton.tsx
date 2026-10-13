"use client";

/** Physical, layered button that presses down into its base (CSS 3D depth). */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/classNames.js";

export type DepthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const DepthButton = forwardRef<HTMLButtonElement, DepthButtonProps>(
  function DepthButton(
    { children, className, type = "button", ...rest }: DepthButtonProps,
    ref,
  ) {
    return (
      <button
        ref={ref}
        {...rest}
        type={type}
        className={cx("depth-button", className)}
      >
        <span className="depth-button-face">{children}</span>
      </button>
    );
  },
);
export default DepthButton;
