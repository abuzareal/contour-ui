"use client";

/** Physical, layered button that presses down into its base (CSS 3D depth). */
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ccx } from "../../lib/classNames.js";

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
        className={ccx("depth-button", className)}
      >
        <span className={ccx("depth-button-face")}>{children}</span>
      </button>
    );
  },
);
export default DepthButton;
