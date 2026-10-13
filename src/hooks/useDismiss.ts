"use client";
import type { RefObject } from "react";
import useLayerDismiss from "./useLayerDismiss.js";
import type { DismissReason } from "../lib/layers.js";
export type DismissOptions = {
  /** Additional owned elements, including portaled content and the trigger. */
  layerElement?: RefObject<HTMLElement | null>;
  branches?: RefObject<HTMLElement | null>[];
  /** Native modal backdrops own outside-click behavior. */
  outside?: boolean;
};
/** Topmost layer dismissal in the container's document; caller cancellation is respected. */
/** Preserves the public void-returning dismissal hook; built-in layers use an internal handle. */
export default function useDismiss(
  container: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: (
    reason: DismissReason,
    event: KeyboardEvent | PointerEvent,
  ) => void,
  options: DismissOptions = {},
) {
  useLayerDismiss(container, active, onDismiss, options);
}
