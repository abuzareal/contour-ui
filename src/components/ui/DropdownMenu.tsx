/** Button-triggered action menu with roving focus, Escape/outside dismissal, and focus return. */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import useDismiss from "../../hooks/useDismiss.js";
import { cx } from "../../lib/classNames.js";
import { nextIndexForKey } from "../../lib/keyboard.js";

export type MenuItem = {
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  danger?: boolean;
};

export type DropdownMenuProps = {
  label: string;
  items: MenuItem[];
  align?: "start" | "end";
};

export default function DropdownMenu({
  label,
  items,
  align = "start",
}: DropdownMenuProps) {
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) trigger.current?.focus();
  }, []);
  useDismiss(
    container,
    open,
    useCallback((reason) => close(reason === "escape"), [close]),
  );

  useEffect(() => {
    if (open) itemRefs.current[0]?.focus();
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
        onClick={() => setOpen((value) => !value)}
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
            key={item.label}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={cx("menu-item", item.danger && "menu-item-danger")}
            onClick={() => {
              item.onSelect();
              close();
            }}
            onKeyDown={(event) => {
              if (event.key === "Tab") return close(false);
              const next = nextIndexForKey(
                event.key,
                index,
                items.length,
                "vertical",
              );
              if (next === null) return;
              event.preventDefault();
              itemRefs.current[next]?.focus();
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
