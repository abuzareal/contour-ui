"use client";

/** Controlled/default tabs, with props and native refs for root/list/buttons/panels. */
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { nextIndexForKey } from "../../lib/keyboard.js";
import { cx, ccx } from "../../lib/classNames.js";
import useTabRefs from "../../hooks/useTabRefs.js";
import type { NativePartProps } from "../../lib/componentProps.js";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  /** Native styling/events/ref; disabled-tab semantics are not introduced by this part API. */
  buttonProps?: Omit<NativePartProps<"button">, "disabled">;
  panelProps?: NativePartProps<"div">;
};
export type TabsProps = Omit<NativePartProps<"div">, "ref"> & {
  label: string;
  tabs: TabItem[];
  defaultTabId?: string;
  activeTabId?: string;
  onTabChange?: (id: string) => void;
  listProps?: NativePartProps<"div">;
};

const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    label,
    tabs,
    defaultTabId,
    activeTabId,
    onTabChange,
    listProps,
    className,
    id,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id ?? "");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === (activeTabId ?? activeId)),
  );
  const selectedId = tabs[activeIndex]?.id;
  const buttonRefs = useTabRefs(tabs, tabRefs);

  useLayoutEffect(() => {
    const measure = () => {
      const tab =
        selectedId === undefined ? undefined : tabRefs.current.get(selectedId);
      if (tab) {
        const next = { left: tab.offsetLeft, width: tab.offsetWidth };
        setIndicator((current) =>
          current.left === next.left && current.width === next.width
            ? current
            : next,
        );
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [
    selectedId,
    tabs,
    className,
    rest.style,
    listProps?.className,
    listProps?.style,
  ]);
  const select = (tab: TabItem, focus = false) => {
    if (activeTabId === undefined) setActiveId(tab.id);
    onTabChange?.(tab.id);
    if (focus) tabRefs.current.get(tab.id)?.focus();
  };
  const buttonId = (tab: TabItem) =>
    tab.buttonProps?.id ?? `${baseId}-tab-${tab.id}`;
  const panelId = (tab: TabItem) =>
    tab.panelProps?.id ?? `${baseId}-panel-${tab.id}`;

  return (
    <div {...rest} ref={ref} id={id} className={ccx("tabs", className)}>
      <div
        {...listProps}
        className={ccx("tabs-list", listProps?.className)}
        role="tablist"
        aria-label={label}
        style={
          {
            ...listProps?.style,
            "--indicator-left": `${indicator.left}px`,
            "--indicator-width": `${indicator.width}px`,
          } as CSSProperties
        }
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId;
          return (
            <button
              {...tab.buttonProps}
              key={tab.id}
              ref={buttonRefs[index]}
              id={buttonId(tab)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId(tab)}
              tabIndex={selected ? 0 : -1}
              className={ccx("tabs-tab", tab.buttonProps?.className)}
              onClick={(event) => {
                tab.buttonProps?.onClick?.(event);
                if (!event.defaultPrevented) select(tab);
              }}
              onKeyDown={(event) => {
                tab.buttonProps?.onKeyDown?.(event);
                if (event.defaultPrevented) return;
                const next = nextIndexForKey(
                  event.key,
                  index,
                  tabs.length,
                  "horizontal",
                  event.currentTarget.ownerDocument.defaultView?.getComputedStyle(
                    event.currentTarget,
                  ).direction === "rtl"
                    ? "rtl"
                    : "ltr",
                );
                if (next === null) return;
                event.preventDefault();
                select(tabs[next], true);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          {...tab.panelProps}
          key={tab.id}
          id={panelId(tab)}
          role="tabpanel"
          aria-labelledby={cx(
            buttonId(tab),
            tab.panelProps?.["aria-labelledby"],
          )}
          hidden={tab.id !== selectedId}
          tabIndex={0}
          className={ccx("tabs-panel", tab.panelProps?.className)}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
});
export default Tabs;
