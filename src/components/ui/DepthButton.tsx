/** Physical, layered button that presses down into its base (CSS 3D depth). */
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type DepthButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export default function DepthButton({
  children,
  type = "button",
  ...rest
}: DepthButtonProps) {
  return (
    <button {...rest} type={type} className="depth-button">
      <span className="depth-button-face">{children}</span>
    </button>
  );
}
