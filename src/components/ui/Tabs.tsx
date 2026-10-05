/** Tabs with a sliding underline indicator, arrow-key navigation, and linked panels. */
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { nextIndexForKey } from "../../lib/keyboard.js";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

export type TabsProps = {
  label: string;
  tabs: TabItem[];
  defaultTabId?: string;
};

export default function Tabs({ label, tabs, defaultTabId }: TabsProps) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id ?? "");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.id === activeId),
  );
  const selectedId = tabs[activeIndex]?.id;

  useLayoutEffect(() => {
    const measure = () => {
      const tab = tabRefs.current[activeIndex];
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeIndex]);

  const select = (index: number) => {
    setActiveId(tabs[index].id);
    tabRefs.current[index]?.focus();
  };

  return (
    <div className="tabs">
      <div
        className="tabs-list"
        role="tablist"
        aria-label={label}
        style={
          {
            "--indicator-left": `${indicator.left}px`,
            "--indicator-width": `${indicator.width}px`,
          } as CSSProperties
        }
      >
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              id={`${baseId}-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              className="tabs-tab"
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => {
                const next = nextIndexForKey(event.key, index, tabs.length);
                if (next === null) return;
                event.preventDefault();
                select(next);
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`${baseId}-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== selectedId}
          tabIndex={0}
          className="tabs-panel"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
