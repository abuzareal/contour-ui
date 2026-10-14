"use client";
import { type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import useFloatingPanel, {
  floatingContainer,
  type FloatingOptions,
} from "../../hooks/useFloatingPanel.js";
import FloatingScope from "./FloatingScope.js";
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
  const target =
    anchorElement && options.portal !== false
      ? floatingContainer(anchorElement, options)
      : null;
  useFloatingPanel(anchor, panel, open, { ...options, container: target });
  const content = (
    <FloatingScope anchor={anchorElement} open={open} target={target}>
      {children}
    </FloatingScope>
  );
  return target ? createPortal(content, target) : content;
}
