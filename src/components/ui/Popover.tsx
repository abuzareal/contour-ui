"use client";
import {
  useContext,
  useLayoutEffect,
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from "react";
import useOpenState from "../../hooks/useOpenState.js";
import useDismiss from "../../hooks/useLayerDismiss.js";
import useControlRef from "../../hooks/useControlRef.js";
import usePanelFocus, {
  type PanelFocusOptions,
} from "../../hooks/usePanelFocus.js";
import type { FloatingOptions } from "../../hooks/useFloatingPanel.js";
import { cx, ccx } from "../../lib/classNames.js";
import { composeRefs } from "../../lib/composeRefs.js";
import {
  LayerVisibility,
  LayerParent,
  type DismissReason,
} from "../../lib/layers.js";
import type { NativePartProps } from "../../lib/componentProps.js";
import OverlayTrigger from "./OverlayTrigger.js";
import FloatingPortal from "./FloatingPortal.js";
export type PopoverProps = Omit<NativePartProps<"div">, "ref" | "title"> &
  FloatingOptions &
  PanelFocusOptions & {
    trigger: ReactNode;
    title: string;
    children: ReactNode;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    triggerProps?: NativePartProps<"button">;
    panelProps?: NativePartProps<"div">;
    /** Render one ref-forwarding native button with the supplied owned props. */
    renderTrigger?: (
      props: NativePartProps<"button"> & { children: ReactNode },
    ) => ReactElement;
    /** preventDefault vetoes dismissal. Native document events still propagate. */
    onDismiss?: (
      reason: DismissReason,
      event: KeyboardEvent | PointerEvent,
    ) => void;
  };
const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  {
    trigger,
    title,
    children,
    align = "start",
    side = "bottom",
    sideOffset = 8,
    collisionPadding = 8,
    portal = true,
    container: portalContainer,
    initialFocus,
    onOpenAutoFocus,
    onCloseAutoFocus,
    renderTrigger,
    onDismiss,
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
  const generatedPanelId = useId(),
    titleId = useId();
  const panelId = panelProps?.id ?? generatedPanelId;
  const [open, setOpen] = useOpenState(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const parentVisible = useContext(LayerVisibility);
  const visibleOpen = open && parentVisible;
  const { ref: root, attach: attachRoot } = useControlRef(forwardedRef);
  const { ref: button, attach: attachButton } = useControlRef(
    triggerProps?.ref ?? null,
  );
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null,
  );
  const attachAnchor = useMemo(
    () => composeRefs(attachButton, setAnchorElement),
    [attachButton],
  );
  const panel = useRef<HTMLDivElement>(null);
  const attachPanel = useMemo(
    () => composeRefs(panel, panelProps?.ref),
    [panelProps?.ref],
  );
  const reason = useRef<{ value: string | undefined }>({ value: undefined });
  const layer = useDismiss(
    root,
    visibleOpen,
    (why, event) => {
      onDismiss?.(why, event);
      if (event.defaultPrevented) return;
      reason.current.value = why;
      setOpen(false);
      if (why === "escape" && !onCloseAutoFocus && button.current?.isConnected)
        button.current.focus();
    },
    { branches: [panel, button], layerElement: panel },
  );
  useLayoutEffect(() => {
    if (visibleOpen) reason.current.value = undefined;
  }, [visibleOpen, anchorElement]);
  usePanelFocus(
    visibleOpen,
    button,
    panel,
    reason,
    { initialFocus, onOpenAutoFocus, onCloseAutoFocus },
    anchorElement,
    layer,
  );
  const ownedTrigger = {
    ...triggerProps,
    ref: attachAnchor,
    type: "button" as const,
    className: ccx("menu-trigger", triggerProps?.className),
    "aria-haspopup": "dialog" as const,
    "aria-expanded": visibleOpen,
    "aria-controls": panelId,
    children: trigger,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      triggerProps?.onClick?.(event);
      if (event.defaultPrevented) return;
      if (!triggerProps?.disabled) {
        reason.current.value = "trigger";
        setOpen(!open);
      }
    },
  };
  return (
    <LayerVisibility.Provider value={visibleOpen}>
      <LayerParent.Provider value={layer}>
        <div
          {...rest}
          ref={attachRoot}
          className={ccx("popover", `popover-${align}`, className)}
        >
          <OverlayTrigger renderer={renderTrigger} props={ownedTrigger} />
          <FloatingPortal
            anchorElement={anchorElement}
            anchor={button}
            panel={panel}
            open={visibleOpen}
            options={{
              side,
              align,
              sideOffset,
              collisionPadding,
              portal,
              container: portalContainer,
            }}
          >
            <div
              {...panelProps}
              ref={attachPanel}
              id={panelId}
              role="dialog"
              tabIndex={panelProps?.tabIndex ?? -1}
              aria-labelledby={cx(titleId, panelProps?.["aria-labelledby"])}
              className={ccx("popover-panel", panelProps?.className)}
              hidden={!visibleOpen}
            >
              <strong id={titleId} className={ccx("popover-title")}>
                {title}
              </strong>
              {children}
            </div>
          </FloatingPortal>
        </div>
      </LayerParent.Provider>
    </LayerVisibility.Provider>
  );
});
export default Popover;
