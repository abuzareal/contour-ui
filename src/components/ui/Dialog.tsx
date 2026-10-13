"use client";

/** Native controlled modal, with refs and props for its existing DOM parts. */
import { forwardRef, useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "../../lib/classNames.js";
import { lockDocumentScroll } from "../../lib/lockDocumentScroll.js";
import { composeEventHandlers } from "../../lib/composeEventHandlers.js";
import type { NativePartProps } from "../../lib/componentProps.js";
import useControlRef from "../../hooks/useControlRef.js";

export type DialogProps = Omit<
  NativePartProps<"dialog">,
  "ref" | "open" | "onClose" | "title"
> & {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  placement?: "center" | "left" | "right";
  panelProps?: NativePartProps<"div">;
  bodyProps?: NativePartProps<"div">;
  footerProps?: NativePartProps<"footer">;
  closeButtonProps?: NativePartProps<"button">;
};

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    children,
    description,
    footer,
    placement = "center",
    className,
    onCancel,
    onClick,
    panelProps,
    bodyProps,
    footerProps,
    closeButtonProps,
    ...rest
  },
  forwardedRef,
) {
  const { ref, attach } = useControlRef(forwardedRef);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const release = lockDocumentScroll(dialog.ownerDocument);
    dialog.addEventListener("close", release);
    return () => {
      dialog.removeEventListener("close", release);
      release();
    };
  }, [open, ref]);

  return (
    <dialog
      {...rest}
      ref={attach}
      role="dialog"
      aria-modal={open || undefined}
      className={cx("dialog", `dialog-${placement}`, className)}
      aria-labelledby={cx(titleId, rest["aria-labelledby"])}
      aria-describedby={
        cx(description && descriptionId, rest["aria-describedby"]) || undefined
      }
      onCancel={(event) => {
        onCancel?.(event);
        const canceled = event.defaultPrevented;
        // The browser must never close the element independently of the controlled open prop.
        event.preventDefault();
        if (!canceled) onClose();
      }}
      onClick={composeEventHandlers(onClick, (event) => {
        if (event.target === event.currentTarget) onClose();
      })}
    >
      <div
        {...panelProps}
        className={cx("dialog-panel", panelProps?.className)}
      >
        <header className="dialog-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && (
              <p id={descriptionId} className="dialog-description">
                {description}
              </p>
            )}
          </div>
          <button
            {...closeButtonProps}
            type="button"
            className={cx("dialog-close", closeButtonProps?.className)}
            aria-label={closeButtonProps?.["aria-label"] ?? "Close dialog"}
            onClick={composeEventHandlers(closeButtonProps?.onClick, () =>
              onClose(),
            )}
          >
            <X size={18} />
          </button>
        </header>
        <div {...bodyProps} className={cx("dialog-body", bodyProps?.className)}>
          {children}
        </div>
        {footer && (
          <footer
            {...footerProps}
            className={cx("dialog-footer", footerProps?.className)}
          >
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
});
export default Dialog;
