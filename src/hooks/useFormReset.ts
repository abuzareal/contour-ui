"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/** Native reset fires before the browser restores default values. */
export default function useFormReset<
  T extends HTMLInputElement | HTMLTextAreaElement,
>(ref: RefObject<T | null>, sync: () => void) {
  const synchronize = useRef(sync);
  useLayoutEffect(() => {
    synchronize.current = sync;
  });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reset = (event: Event) => {
      if (!element.form || event.target !== element.form) return;
      clearTimeout(timer);
      // A microtask can run before the reset default action for browser-originated
      // events. A task observes the restored value and later preventDefault calls.
      timer = setTimeout(() => {
        if (!event.defaultPrevented) synchronize.current();
      }, 0);
    };
    element.ownerDocument.addEventListener("reset", reset, true);
    return () => {
      clearTimeout(timer);
      element.ownerDocument.removeEventListener("reset", reset, true);
    };
  }, [ref]);
}
