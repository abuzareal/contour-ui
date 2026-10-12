"use client";

/** Nonmodal local panel; root and existing trigger/panel props preserve owned state wiring. */
import { forwardRef, useCallback, useId, type ReactNode } from "react";
import useOpenState from "../../hooks/useOpenState.js";
import useDismiss from "../../hooks/useDismiss.js";
import useControlRef from "../../hooks/useControlRef.js";
import { cx } from "../../lib/classNames.js";
import { composeEventHandlers } from "../../lib/composeEventHandlers.js";
import type { NativePartProps } from "../../lib/componentProps.js";

export type PopoverProps = Omit<NativePartProps<"div">, "ref" | "title"> & {
  /** Content inside the owned trigger button, not a replacement interactive element. */
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  align?: "start" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerProps?: NativePartProps<"button">;
  panelProps?: NativePartProps<"div">;
};

const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    title,
    children,
    align = "start",
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    className,
    triggerProps,
    panelProps,
    ...rest
  },
  forwardedRef,
) {
  const generatedPanelId = useId();
  const panelId = panelProps?.id ?? generatedPanelId;
  const titleId = useId();
  const [open, setOpen] = useOpenState(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const { ref: container, attach: attachContainer } =
    useControlRef(forwardedRef);
  const { ref: button, attach: attachButton } = useControlRef(
    triggerProps?.ref ?? null,
  );
  useDismiss(
    container,
    open,
    useCallback(
      (reason) => {
        setOpen(false);
        if (reason === "escape") button.current?.focus();
      },
      [setOpen, button],
    ),
  );

  return (
    <div
      {...rest}
      ref={attachContainer}
      className={cx("popover", `popover-${align}`, className)}
    >
      <button
        {...triggerProps}
        ref={attachButton}
        type="button"
        className={cx("menu-trigger", triggerProps?.className)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={composeEventHandlers(triggerProps?.onClick, () => {
          if (!triggerProps?.disabled) setOpen(!open);
        })}
      >
        {trigger}
      </button>
      <div
        {...panelProps}
        id={panelId}
        role="dialog"
        aria-labelledby={cx(titleId, panelProps?.["aria-labelledby"])}
        className={cx("popover-panel", panelProps?.className)}
        hidden={!open}
      >
        <strong id={titleId} className="popover-title">
          {title}
        </strong>
        {children}
      </div>
    </div>
  );
});
export default Popover;
