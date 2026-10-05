/** Non-modal floating panel anchored to a trigger; closes on Escape or an outside press. */
import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import useDismiss from "../../hooks/useDismiss.js";
import { cx } from "../../lib/classNames.js";

export type PopoverProps = {
  /** Text for the trigger button. */
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  align?: "start" | "end";
};

export default function Popover({
  trigger,
  title,
  children,
  align = "start",
}: PopoverProps) {
  const panelId = useId();
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useDismiss(
    container,
    open,
    useCallback((reason) => {
      setOpen(false);
      if (reason === "escape") button.current?.focus();
    }, []),
  );

  return (
    <div ref={container} className={cx("popover", `popover-${align}`)}>
      <button
        ref={button}
        type="button"
        className="menu-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {trigger}
      </button>
      <div
        id={panelId}
        role="dialog"
        aria-labelledby={titleId}
        className="popover-panel"
        hidden={!open}
      >
        <strong id={titleId} className="popover-title">
          {title}
        </strong>
        {children}
      </div>
    </div>
  );
}
