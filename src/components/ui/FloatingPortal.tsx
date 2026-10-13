"use client";
import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import useFloatingPanel, {
  floatingContainer,
  type FloatingOptions,
} from "../../hooks/useFloatingPanel.js";
export default function FloatingPortal({
  anchor,
  anchorElement,
  panel,
  open,
  options,
  children,
}: {
  anchor: RefObject<HTMLElement | null>;
  anchorElement: HTMLElement | null;
  panel: RefObject<HTMLElement | null>;
  open: boolean;
  options: FloatingOptions;
  children: ReactNode;
}) {
  const scope = useRef<HTMLSpanElement>(null);
  const target =
    anchorElement && options.portal !== false
      ? floatingContainer(anchorElement, options)
      : null;
  useLayoutEffect(() => {
    const root = scope.current;
    if (!open || !anchorElement || !root) return;
    const view = anchorElement.ownerDocument.defaultView;
    if (!view) return;
    const synchronize = () => {
      const computed = view.getComputedStyle(anchorElement);
      // Copy inherited CSS variables without controlling the host document's theme.
      for (let index = 0; index < computed.length; index++) {
        const name = computed.item(index);
        if (name.startsWith("--"))
          root.style.setProperty(name, computed.getPropertyValue(name));
      }
      root.dir = computed.direction;
      root.style.fontFamily = computed.fontFamily;
      root.style.color = computed.color;
    };
    synchronize();
    const observer = new view.MutationObserver(synchronize);
    let ancestor: HTMLElement | null = anchorElement;
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
  }, [anchorElement, target, open]);
  useFloatingPanel(anchor, panel, open, { ...options, container: target });
  const content = (
    <span
      ref={scope}
      className="contour-floating-root contour-root"
      style={{ display: "contents" }}
    >
      {children}
    </span>
  );
  return target ? createPortal(content, target) : content;
}
