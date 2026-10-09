"use client";

/** Non-modal floating panel anchored to a trigger; closes on Escape or an outside press. */
import { useCallback, useId, useRef, type ReactNode } from "react";
import useOpenState from "../../hooks/useOpenState.js";
import useDismiss from "../../hooks/useDismiss.js";
import { cx } from "../../lib/classNames.js";

export type PopoverProps = {
  /** Text for the trigger button. */
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  align?: "start" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function Popover({
  trigger,
  title,
  children,
  align = "start",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: PopoverProps) {
  const panelId = useId();
  const titleId = useId();
  const [open, setOpen] = useOpenState(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const container = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useDismiss(
    container,
    open,
    useCallback(
      (reason) => {
        setOpen(false);
        if (reason === "escape") button.current?.focus();
      },
      [setOpen],
    ),
  );

  return (
    <div ref={container} className={cx("popover", `popover-${align}`)}>
      <button
        ref={button}
        type="button"
        className="menu-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
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
