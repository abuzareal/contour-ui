/** Brand asterisk that spins as a loading indicator; announces its label to assistive tech. */
import { Asterisk } from "lucide-react";
import { cx } from "../../lib/classNames.js";

export type SpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const iconSizes = { sm: 16, md: 24, lg: 40 };

export default function Spinner({
  size = "md",
  label = "Loading",
  className,
}: SpinnerProps) {
  return (
    <span role="status" className={cx("spinner", `spinner-${size}`, className)}>
      <Asterisk size={iconSizes[size]} strokeWidth={1.6} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </span>
  );
}
