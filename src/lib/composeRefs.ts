import type { Ref, RefCallback } from "react";

/** Retain internal nodes and caller refs, honoring React 19 cleanup callbacks on detach. */
export function composeRefs<Element>(
  ...refs: (Ref<Element> | undefined)[]
): RefCallback<Element> {
  let cleanups: (() => void)[] = [];
  return (element) => {
    for (const cleanup of cleanups) cleanup();
    cleanups = [];
    if (element === null) return;
    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup: unknown = ref(element);
        cleanups.push(
          typeof cleanup === "function" ? () => cleanup() : () => ref(null),
        );
      } else if (ref) {
        // RefObject is read-only in React 18's consumer types; assigning is React's ref contract.
        Object.assign(ref, { current: element });
        cleanups.push(() => {
          Object.assign(ref, { current: null });
        });
      }
    }
  };
}
