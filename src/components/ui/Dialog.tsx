"use client";

/** Modal dialog on the native <dialog> element; also slides in from either edge as a drawer. */
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cx } from "../../lib/classNames.js";
import { lockDocumentScroll } from "../../lib/lockDocumentScroll.js";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  footer?: ReactNode;
  placement?: "center" | "left" | "right";
};

export default function Dialog({
  open,
  onClose,
  title,
  children,
  description,
  footer,
  placement = "center",
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
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
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={cx("dialog", `dialog-${placement}`)}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // A click on the element itself (not its panel) is a backdrop click.
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-panel">
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
            type="button"
            className="dialog-close"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <div className="dialog-body">{children}</div>
        {footer && <footer className="dialog-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
