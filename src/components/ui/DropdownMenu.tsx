"use client";

/** Button-triggered action menu with roving focus, Escape/outside dismissal, and focus return. */
import {
  useContext,
  useCallback,
  useEffect,
  useId,
  useRef,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import useOpenState from "../../hooks/useOpenState.js";
import OverlayTrigger from "./OverlayTrigger.js";
import useControlRef from "../../hooks/useControlRef.js";
import { composeRefs } from "../../lib/composeRefs.js";
import FloatingPortal from "./FloatingPortal.js";
import type { FloatingOptions } from "../../hooks/useFloatingPanel.js";
import type { NativePartProps } from "../../lib/componentProps.js";
import {
  LayerVisibility,
  LayerParent,
  type DismissReason,
} from "../../lib/layers.js";
import useDismiss from "../../hooks/useLayerDismiss.js";
import { ccx } from "../../lib/classNames.js";
import { nextIndexForKey } from "../../lib/keyboard.js";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** Stable identity when labels are duplicated or translated. */
  id?: string;
};

export type DropdownMenuProps = FloatingOptions & {
  label: string;
  items: MenuItem[];
  triggerProps?: NativePartProps<"button">;
  renderTrigger?: (
    props: NativePartProps<"button"> & { children: ReactNode },
  ) => ReactElement;
  onDismiss?: (
    reason: DismissReason,
    event: KeyboardEvent | PointerEvent,
  ) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function DropdownMenu({
  label,
  items,
  align = "start",
  side = "bottom",
  sideOffset = 8,
  collisionPadding = 8,
  portal = true,
  container: portalContainer,
  triggerProps,
  renderTrigger,
  onDismiss,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DropdownMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useOpenState(
    controlledOpen,
    defaultOpen,
    onOpenChange,
  );
  const parentVisible = useContext(LayerVisibility);
  const visibleOpen = open && parentVisible;
  const container = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const { ref: trigger, attach: attachButton } = useControlRef(
    triggerProps?.ref ?? null,
  );
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null,
  );
  const attachTrigger = useMemo(
    () => composeRefs(attachButton, setAnchorElement),
    [attachButton],
  );
  const initialFocus = useRef<"first" | "last">("first");
  const search = useRef({ value: "", time: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false);
      if (returnFocus) trigger.current?.focus();
    },
    [setOpen, trigger],
  );
  const layer = useDismiss(
    container,
    visibleOpen,
    (reason, event) => {
      onDismiss?.(reason, event);
      if (!event.defaultPrevented) close(reason === "escape");
    },
    { branches: [panel, trigger], layerElement: panel },
  );

  useEffect(() => {
    if (!visibleOpen) return;
    search.current = { value: "", time: 0 };
    const enabled = itemRefs.current.filter((item) => item && !item.disabled);
    const first = initialFocus.current === "last" ? enabled.at(-1) : enabled[0];
    (first ?? panel.current)?.focus();
  }, [visibleOpen, anchorElement]);

  const ownedTrigger = {
    ...triggerProps,
    ref: attachTrigger,
    type: "button" as const,
    className: ccx("menu-trigger", triggerProps?.className),
    "aria-haspopup": "menu" as const,
    "aria-expanded": visibleOpen,
    "aria-controls": menuId,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
      triggerProps?.onClick?.(event);
      if (!event.defaultPrevented && !triggerProps?.disabled) {
        initialFocus.current = "first";
        setOpen(!open);
      }
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
      triggerProps?.onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (
        triggerProps?.disabled ||
        (event.key !== "ArrowDown" && event.key !== "ArrowUp")
      )
        return;
      event.preventDefault();
      initialFocus.current = event.key === "ArrowUp" ? "last" : "first";
      if (!open) setOpen(true);
      else {
        const enabled = itemRefs.current.filter(
          (item) => item && !item.disabled,
        );
        (initialFocus.current === "last"
          ? enabled.at(-1)
          : enabled[0]
        )?.focus();
      }
    },
    children: (
      <>
        {label}
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={ccx("menu-chevron")}
        />
      </>
    ),
  };
  return (
    <LayerVisibility.Provider value={visibleOpen}>
      <LayerParent.Provider value={layer}>
        <div ref={container} className={ccx("menu", `menu-${align}`)}>
          <OverlayTrigger renderer={renderTrigger} props={ownedTrigger} />
          <FloatingPortal
            anchorElement={anchorElement}
            anchor={trigger}
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
              ref={panel}
              id={menuId}
              role="menu"
              tabIndex={-1}
              aria-label={label}
              className={ccx("menu-list")}
              hidden={!visibleOpen}
            >
              {items.map((item, index) => (
                <button
                  key={item.id ?? item.label}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  disabled={item.disabled}
                  className={ccx(
                    "menu-item",
                    item.danger && "menu-item-danger",
                  )}
                  onClick={() => {
                    item.onSelect();
                    close();
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Tab") return close(false);
                    const enabled = items
                      .map((entry, position) =>
                        entry.disabled ? -1 : position,
                      )
                      .filter((position) => position !== -1);
                    const next = nextIndexForKey(
                      event.key,
                      enabled.indexOf(index),
                      enabled.length,
                      "vertical",
                    );
                    if (next !== null) {
                      event.preventDefault();
                      itemRefs.current[enabled[next]]?.focus();
                    } else if (
                      event.key.length === 1 &&
                      !event.ctrlKey &&
                      !event.altKey &&
                      !event.metaKey
                    ) {
                      const now = performance.now();
                      const previous =
                        now - search.current.time < 500
                          ? search.current.value
                          : "";
                      const value =
                        previous &&
                        [...previous].every(
                          (letter) => letter === event.key.toLowerCase(),
                        )
                          ? event.key.toLowerCase()
                          : previous + event.key.toLowerCase();
                      search.current = { value, time: now };
                      const start = enabled.indexOf(index) + 1;
                      const ordered = [
                        ...enabled.slice(start),
                        ...enabled.slice(0, start),
                      ];
                      const match = ordered.find((position) =>
                        items[position].label.toLowerCase().startsWith(value),
                      );
                      if (match !== undefined) {
                        event.preventDefault();
                        itemRefs.current[match]?.focus();
                      }
                    }
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </FloatingPortal>
        </div>
      </LayerParent.Provider>
    </LayerVisibility.Provider>
  );
}
