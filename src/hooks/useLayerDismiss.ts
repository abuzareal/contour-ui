"use client";
import {
  useContext,
  useState,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";
import {
  LayerParent,
  registerLayer,
  refreshLayerStack,
  type DismissReason,
} from "../lib/layers.js";
import type { DismissOptions } from "./useDismiss.js";
export default function useLayerDismiss(
  container: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: (
    reason: DismissReason,
    event: KeyboardEvent | PointerEvent,
  ) => void,
  options: DismissOptions = {},
) {
  const [id] = useState(() => Symbol("contour-layer"));
  const parent = useContext(LayerParent);
  const latest = useRef({ onDismiss, options });
  const registration = useRef<
    { doc: Document; parent?: symbol; dispose: () => void } | undefined
  >(undefined);
  // Reconcile each commit so owner-document moves rebind listeners, without reordering on updates.
  useLayoutEffect(() => {
    latest.current = { onDismiss, options };
    const doc = active ? container.current?.ownerDocument : undefined;
    if (
      registration.current &&
      (registration.current.doc !== doc ||
        registration.current.parent !== parent)
    ) {
      registration.current.dispose();
      registration.current = undefined;
    }
    if (!doc) return;
    if (registration.current) {
      refreshLayerStack(doc);
      return;
    }
    registration.current = {
      doc,
      parent,
      dispose: registerLayer(doc, {
        id,
        parent,
        elements: () => [
          container.current,
          ...(latest.current.options.branches ?? []).map((ref) => ref.current),
        ],
        floating: () => latest.current.options.layerElement?.current ?? null,
        dismiss: (reason, event) => latest.current.onDismiss(reason, event),
        get outside() {
          return latest.current.options.outside !== false;
        },
      }),
    };
  });
  useLayoutEffect(
    () => () => {
      registration.current?.dispose();
      registration.current = undefined;
    },
    [],
  );
  return id;
}
