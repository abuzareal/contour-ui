"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Carry the anchor's inherited theme into a portal without changing its host. */
export default function FloatingScope({
  anchor,
  open,
  target,
  onDirectionChange,
  children,
}: {
  anchor: HTMLElement | null;
  open: boolean;
  target: Node | null;
  onDirectionChange?: (direction: "ltr" | "rtl") => void;
  children: ReactNode;
}) {
  const scope = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const root = scope.current;
    const view = anchor?.ownerDocument.defaultView;
    if (!open || !anchor || !root || !view) return;
    const synchronize = () => {
      const computed = view.getComputedStyle(anchor);
      for (let index = 0; index < computed.length; index++) {
        const name = computed.item(index);
        if (name.startsWith("--"))
          root.style.setProperty(name, computed.getPropertyValue(name));
      }
      root.dir = computed.direction;
      root.style.fontFamily = computed.fontFamily;
      root.style.color = computed.color;
      onDirectionChange?.(computed.direction === "rtl" ? "rtl" : "ltr");
    };
    synchronize();
    const observer = new view.MutationObserver(synchronize);
    let ancestor: HTMLElement | null = anchor;
    while (ancestor) {
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: [
          "style",
          "class",
          "dir",
          "data-theme",
          "data-contour-theme",
        ],
      });
      ancestor = ancestor.parentElement;
    }
    return () => observer.disconnect();
  }, [anchor, target, open, onDirectionChange]);
  return (
    <span
      ref={scope}
      className="contour-floating-root contour-root"
      style={{ display: "contents" }}
    >
      {children}
    </span>
  );
}
