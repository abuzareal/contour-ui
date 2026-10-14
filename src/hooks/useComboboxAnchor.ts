"use client";
import { useMemo, type RefObject } from "react";
import { platform } from "@floating-ui/dom";

/** Fixed children of a zoomed body need anchor and viewport in the same local CSS units. */
function windowScale(element: HTMLElement | null) {
  if (
    !element ||
    platform.getOffsetParent?.(element) !== element.ownerDocument.defaultView
  )
    return { x: 1, y: 1 };
  const scale = platform.getScale?.(element);
  if (
    !scale ||
    !("x" in scale) ||
    !("y" in scale) ||
    !Number.isFinite(scale.x) ||
    !Number.isFinite(scale.y) ||
    scale.x <= 0 ||
    scale.y <= 0
  )
    return { x: 1, y: 1 };
  return scale;
}

/** Use public virtual-anchor/Rect extension points; keep upstream focus/selection and positioning. */
export default function useComboboxAnchor(
  input: HTMLInputElement | null,
  floating: RefObject<HTMLDivElement | null>,
) {
  return useMemo(() => {
    const source = input?.parentElement ?? input;
    if (!source) return {};
    return {
      anchor: {
        contextElement: source,
        getBoundingClientRect() {
          const rect = source.getBoundingClientRect(),
            scale = windowScale(floating.current);
          rect.x /= scale.x;
          rect.y /= scale.y;
          rect.width /= scale.x;
          rect.height /= scale.y;
          return rect;
        },
      },
      // Getters are evaluated on each upstream update, including scroll, zoom and mobile viewport resize.
      collisionBoundary: {
        get x() {
          return (
            (source.ownerDocument.defaultView?.visualViewport?.offsetLeft ??
              0) / windowScale(floating.current).x
          );
        },
        get y() {
          return (
            (source.ownerDocument.defaultView?.visualViewport?.offsetTop ?? 0) /
            windowScale(floating.current).y
          );
        },
        get width() {
          return (
            (source.ownerDocument.defaultView?.visualViewport?.width ??
              source.ownerDocument.documentElement.clientWidth) /
            windowScale(floating.current).x
          );
        },
        get height() {
          return (
            (source.ownerDocument.defaultView?.visualViewport?.height ??
              source.ownerDocument.documentElement.clientHeight) /
            windowScale(floating.current).y
          );
        },
      },
    };
  }, [input, floating]);
}
