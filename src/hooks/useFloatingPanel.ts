"use client";
import { useLayoutEffect, type RefObject } from "react";
import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
  platform,
} from "@floating-ui/dom";
export type FloatingOptions = {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  collisionPadding?: number;
  /** false keeps content inline; default portals into its owner body or active modal with inherited theme variables. */
  portal?: boolean;
  /** Must belong to the trigger's document and be inside the active modal, when applicable. */
  container?: HTMLElement | null;
};
export function floatingContainer(
  anchor: HTMLElement,
  options: FloatingOptions,
) {
  // Select the enclosing native dialog before showModal runs: default-open children
  // render in the same commit, while its open attribute is still absent.
  const modal = anchor.closest<HTMLElement>("dialog");
  if (
    options.container &&
    options.container.ownerDocument === anchor.ownerDocument &&
    (!modal || modal.contains(options.container))
  )
    return options.container;
  return modal ?? anchor.ownerDocument.body;
}
/** DOM adapter: clean up observers and ignore obsolete asynchronous positioning results. */
export default function useFloatingPanel(
  anchor: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  open: boolean,
  {
    side = "bottom",
    align = "start",
    sideOffset = 8,
    collisionPadding = 8,
    container,
  }: FloatingOptions,
) {
  useLayoutEffect(() => {
    const reference = anchor.current,
      floating = panel.current;
    const gap = Number.isFinite(sideOffset) ? sideOffset : 8;
    const inset = Number.isFinite(collisionPadding)
      ? Math.max(0, collisionPadding)
      : 8;
    if (!open || !reference || !floating) return;
    let disposed = false,
      revision = 0;
    const properties = [
      "position",
      "left",
      "right",
      "top",
      "bottom",
      "transform",
      "max-width",
      "max-height",
      "min-width",
    ];
    const previous = properties.map((name) => ({
      name,
      value: floating.style.getPropertyValue(name),
      priority: floating.style.getPropertyPriority(name),
    }));
    const previousPlacement = floating.getAttribute("data-placement");
    const view = reference.ownerDocument.defaultView;
    const update = async () => {
      const request = ++revision;
      if (disposed || !floating.isConnected) return;
      floating.style.position = "fixed";
      try {
        const scale = await platform.getScale(floating);
        const offsetParent = await platform.getOffsetParent(floating);
        if (disposed || request !== revision) return;
        // A window offset parent does not normalize inherited CSS zoom. Measure its
        // rendered dimensions and convert viewport coordinates back to local CSS pixels.
        const windowScaled =
          offsetParent === view && (scale.x !== 1 || scale.y !== 1);
        const factorX = windowScaled ? scale.x : 1;
        const factorY = windowScaled ? scale.y : 1;
        const padding = {
          left: inset * factorX,
          right: inset * factorX,
          top: inset * factorY,
          bottom: inset * factorY,
        };
        const result = await computePosition(reference, floating, {
          strategy: "fixed",
          placement: align === "center" ? side : `${side}-${align}`,
          platform: windowScaled
            ? {
                ...platform,
                getDimensions(element) {
                  if (element === floating) {
                    const rect = floating.getBoundingClientRect();
                    return { width: rect.width, height: rect.height };
                  }
                  return platform.getDimensions(element);
                },
              }
            : platform,
          middleware: [
            offset(
              gap * (side === "left" || side === "right" ? factorX : factorY),
            ),
            flip({ padding }),
            shift({ padding, crossAxis: true }),
            size({
              padding,
              apply({ availableWidth, availableHeight }) {
                if (disposed || request !== revision) return;
                const maximumWidth = Math.max(0, availableWidth / factorX);
                floating.style.maxWidth = `${maximumWidth}px`;
                floating.style.maxHeight = `${Math.max(0, availableHeight / factorY)}px`;
                // A CSS minimum must not defeat the viewport constraint at high zoom.
                const minimum = Number.parseFloat(
                  view?.getComputedStyle(floating).minWidth ?? "0",
                );
                if (Number.isFinite(minimum) && minimum > maximumWidth)
                  floating.style.minWidth = `${maximumWidth}px`;
              },
            }),
          ],
        });
        if (disposed || request !== revision) return;
        Object.assign(floating.style, {
          position: "fixed",
          left: `${result.x / factorX}px`,
          top: `${result.y / factorY}px`,
          right: "auto",
          bottom: "auto",
          transform: "none",
        });
        floating.dataset.placement = result.placement;
      } catch (error) {
        if (disposed || request !== revision) return;
        // Preserve reachable content if the owner document cannot provide geometry.
        Object.assign(floating.style, {
          position: "fixed",
          left: `${inset}px`,
          top: `${inset}px`,
          right: "auto",
          bottom: "auto",
          transform: "none",
        });
        floating.dataset.placement = "fallback";
        console.warn(
          "Contour floating positioning used its viewport fallback.",
          error,
        );
      }
    };
    const cleanup = autoUpdate(
      reference,
      floating,
      () => {
        void update();
      },
      {
        elementResize: typeof view?.ResizeObserver === "function",
        layoutShift: typeof view?.IntersectionObserver === "function",
      },
    );
    return () => {
      disposed = true;
      cleanup();
      for (const { name, value, priority } of previous) {
        if (value) floating.style.setProperty(name, value, priority);
        else floating.style.removeProperty(name);
      }
      if (previousPlacement === null)
        floating.removeAttribute("data-placement");
      else floating.setAttribute("data-placement", previousPlacement);
    };
  }, [
    anchor,
    panel,
    open,
    side,
    align,
    sideOffset,
    collisionPadding,
    container,
  ]);
}
