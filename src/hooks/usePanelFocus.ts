"use client";
import { layerOwnsFocus, isTopLayer } from "../lib/layers.js";
import { useLayoutEffect, useRef, type RefObject } from "react";
export type PanelFocusOptions = {
  initialFocus?: RefObject<HTMLElement | null> | false;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
};
type Registration = {
  node: HTMLElement;
  doc: Document;
  dispose: (returnFocus: boolean) => void;
};
/** Reconcile actual node/document moves without treating new callback props as a close. */
export default function usePanelFocus(
  open: boolean,
  trigger: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  reason: RefObject<{ value: string | undefined }>,
  options: PanelFocusOptions,
  anchorElement?: HTMLElement | null,
  layer?: symbol,
) {
  const policy = useRef(options);
  const registration = useRef<Registration | undefined>(undefined);
  useLayoutEffect(() => {
    policy.current = options;
    const node = open && anchorElement ? panel.current : null;
    const old = registration.current;
    if (old && (!node || old.node !== node || old.doc !== node.ownerDocument)) {
      old.dispose(!open);
      registration.current = undefined;
    }
    if (!node || registration.current) return;
    const doc = node.ownerDocument,
      returnTarget = trigger.current,
      returnReason = reason.current;
    const owns = () =>
      node.contains(doc.activeElement) ||
      (layer !== undefined && layerOwnsFocus(doc, layer));
    let ownedFocus = owns();
    const observeFocus = () => {
      ownedFocus = owns();
    };
    doc.addEventListener("focusin", observeFocus);
    const EventType = doc.defaultView?.Event ?? Event;
    const event = new EventType("contour-open-auto-focus", {
      cancelable: true,
    });
    policy.current.onOpenAutoFocus?.(event);
    if (
      !event.defaultPrevented &&
      (layer === undefined || isTopLayer(doc, layer)) &&
      policy.current.initialFocus !== false
    )
      (policy.current.initialFocus?.current ?? node).focus();
    ownedFocus = owns();
    const currentPolicy = policy;
    registration.current = {
      node,
      doc,
      dispose(returnFocus) {
        doc.removeEventListener("focusin", observeFocus);
        if (!returnFocus) return;
        const closeEvent = new EventType("contour-close-auto-focus", {
          cancelable: true,
        });
        currentPolicy.current.onCloseAutoFocus?.(closeEvent);
        if (
          returnReason?.value !== "outside" &&
          !closeEvent.defaultPrevented &&
          returnTarget?.isConnected &&
          (returnReason?.value === "escape" || ownedFocus)
        )
          returnTarget.focus();
      },
    };
  });
  useLayoutEffect(
    () => () => {
      registration.current?.dispose(true);
      registration.current = undefined;
    },
    [],
  );
}
