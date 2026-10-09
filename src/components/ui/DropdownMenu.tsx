"use client";

/** Button-triggered action menu with roving focus, Escape/outside dismissal, and focus return. */
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import useOpenState from "../../hooks/useOpenState.js";
import useDismiss from "../../hooks/useDismiss.js";
import { cx } from "../../lib/classNames.js";
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

export type DropdownMenuProps = {
  label: string;
  items: MenuItem[];
  align?: "start" | "end";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function DropdownMenu({
  label,
  items,
  align = "start",
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
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const initialFocus = useRef<"first" | "last">("first");
  const search = useRef({ value: "", time: 0 });
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback(
    (returnFocus = true) => {
      setOpen(false);
      if (returnFocus) trigger.current?.focus();
    },
    [setOpen],
  );
  useDismiss(
    container,
    open,
    useCallback((reason) => close(reason === "escape"), [close]),
  );

  useEffect(() => {
    if (!open) return;
    search.current = { value: "", time: 0 };
    const enabled = itemRefs.current.filter((item) => item && !item.disabled);
    (initialFocus.current === "last" ? enabled.at(-1) : enabled[0])?.focus();
  }, [open]);

  return (
    <div ref={container} className={cx("menu", `menu-${align}`)}>
      <button
        ref={trigger}
        type="button"
        className="menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => {
          initialFocus.current = "first";
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
          event.preventDefault();
          initialFocus.current = event.key === "ArrowUp" ? "last" : "first";
          if (open) {
            const enabled = itemRefs.current.filter(
              (item) => item && !item.disabled,
            );
            (initialFocus.current === "last"
              ? enabled.at(-1)
              : enabled[0]
            )?.focus();
          } else setOpen(true);
        }}
      >
        {label}
        <ChevronDown size={15} aria-hidden="true" className="menu-chevron" />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label={label}
        className="menu-list"
        hidden={!open}
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
            className={cx("menu-item", item.danger && "menu-item-danger")}
            onClick={() => {
              item.onSelect();
              close();
            }}
            onKeyDown={(event) => {
              if (event.key === "Tab") return close(false);
              const enabled = items
                .map((entry, position) => (entry.disabled ? -1 : position))
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
                  now - search.current.time < 500 ? search.current.value : "";
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
    </div>
  );
}
