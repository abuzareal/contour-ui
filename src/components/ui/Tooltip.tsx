/** Ink tooltip shown on hover or focus, dismissible with Escape, described via aria-describedby. */
import { cloneElement, useId, useState, type ReactElement } from "react";
import { cx } from "../../lib/classNames.js";

export type TooltipProps = {
  content: string;
  /** A single focusable element, e.g. a button. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  placement?: "top" | "bottom" | "left" | "right";
};

export default function Tooltip({
  content,
  children,
  placement = "top",
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="tooltip-anchor"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      {cloneElement(children, {
        "aria-describedby": [children.props["aria-describedby"], id]
          .filter(Boolean)
          .join(" "),
      })}
      <span
        id={id}
        role="tooltip"
        className={cx(
          "tooltip mono",
          `tooltip-${placement}`,
          open && "is-open",
        )}
      >
        {content}
      </span>
    </span>
  );
}
