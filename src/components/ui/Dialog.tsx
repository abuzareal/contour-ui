"use client";

/** Native controlled modal, with refs and props for its existing DOM parts. */
import {
  useContext,
  forwardRef,
  useEffect,
  useId,
  useRef,
  type RefObject,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cx, ccx } from "../../lib/classNames.js";
import { lockDocumentScroll } from "../../lib/lockDocumentScroll.js";
import { composeEventHandlers } from "../../lib/composeEventHandlers.js";
import type { NativePartProps } from "../../lib/componentProps.js";
import useDismiss from "../../hooks/useLayerDismiss.js";
import { LayerVisibility, LayerParent, isTopLayer } from "../../lib/layers.js";
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
  initialFocus?: RefObject<HTMLElement | null>;
  onOpenAutoFocus?: (event: Event) => void;
  panelProps?: NativePartProps<"div">;
  bodyProps?: NativePartProps<"div">;
  footerProps?: NativePartProps<"footer">;
  closeButtonProps?: NativePartProps<"button">;
};

const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  {
    open,
    initialFocus,
    onOpenAutoFocus,
    onClose,
    title,
    children,
    description,
    footer,
    placement = "center",
    className,
    onCancel,
    onClick,
    onPointerDown,
    panelProps,
    bodyProps,
    footerProps,
    closeButtonProps,
    ...rest
  },
  forwardedRef,
) {
  const { ref, attach } = useControlRef(forwardedRef);
  const suppressBackdrop = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const parentVisible = useContext(LayerVisibility);
  const visibleOpen = open && parentVisible;
  const layer = useDismiss(
    ref,
    visibleOpen,
    (reason) => {
      const node = ref.current;
      if (reason === "escape" && node) {
        const EventType = node.ownerDocument.defaultView?.Event ?? Event;
        node.dispatchEvent(new EventType("cancel", { cancelable: true }));
      }
    },
    { outside: false },
  );
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (visibleOpen && !dialog.open) {
      dialog.showModal();
      const EventType = dialog.ownerDocument.defaultView?.Event ?? Event;
      const event = new EventType("contour-open-auto-focus", {
        cancelable: true,
      });
      onOpenAutoFocus?.(event);
      if (!event.defaultPrevented) initialFocus?.current?.focus();
    }
    if (!visibleOpen && dialog.open) dialog.close();
    if (!visibleOpen) return;
    const release = lockDocumentScroll(dialog.ownerDocument);
    dialog.addEventListener("close", release);
    return () => {
      dialog.removeEventListener("close", release);
      release();
    };
  }, [visibleOpen, ref, initialFocus, onOpenAutoFocus]);

  return (
    <LayerVisibility.Provider value={visibleOpen}>
      <LayerParent.Provider value={layer}>
        <dialog
          {...rest}
          ref={attach}
          role="dialog"
          aria-modal={visibleOpen || undefined}
          className={ccx("dialog", `dialog-${placement}`, className)}
          aria-labelledby={cx(titleId, rest["aria-labelledby"])}
          aria-describedby={
            cx(description && descriptionId, rest["aria-describedby"]) ||
            undefined
          }
          onCancel={(event) => {
            onCancel?.(event);
            const canceled = event.defaultPrevented;
            // The browser must never close the element independently of the controlled open prop.
            event.preventDefault();
            if (
              !canceled &&
              isTopLayer(event.currentTarget.ownerDocument, layer)
            )
              onClose();
          }}
          onPointerDown={(event) => {
            onPointerDown?.(event);
            if (event.target === event.currentTarget)
              suppressBackdrop.current = !isTopLayer(
                event.currentTarget.ownerDocument,
                layer,
              );
          }}
          onClick={(event) => {
            const suppressed = suppressBackdrop.current;
            suppressBackdrop.current = false;
            onClick?.(event);
            if (
              !event.defaultPrevented &&
              !suppressed &&
              event.target === event.currentTarget
            )
              onClose();
          }}
        >
          <div
            {...panelProps}
            className={ccx("dialog-panel", panelProps?.className)}
          >
            <header className={ccx("dialog-header")}>
              <div>
                <h2 id={titleId}>{title}</h2>
                {description && (
                  <p id={descriptionId} className={ccx("dialog-description")}>
                    {description}
                  </p>
                )}
              </div>
              <button
                {...closeButtonProps}
                type="button"
                className={ccx("dialog-close", closeButtonProps?.className)}
                aria-label={closeButtonProps?.["aria-label"] ?? "Close dialog"}
                onClick={composeEventHandlers(closeButtonProps?.onClick, () =>
                  onClose(),
                )}
              >
                <X size={18} />
              </button>
            </header>
            <div
              {...bodyProps}
              className={ccx("dialog-body", bodyProps?.className)}
            >
              {children}
            </div>
            {footer && (
              <footer
                {...footerProps}
                className={ccx("dialog-footer", footerProps?.className)}
              >
                {footer}
              </footer>
            )}
          </div>
        </dialog>
      </LayerParent.Provider>
    </LayerVisibility.Provider>
  );
});
export default Dialog;
