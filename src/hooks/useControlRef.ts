"use client";

import { useImperativeHandle, useRef, type ForwardedRef } from "react";

/** Expose the native control while retaining an internal ref for reset/size behavior. */
export default function useControlRef<T extends HTMLElement>(
  forwarded: ForwardedRef<T>,
) {
  const ref = useRef<T | null>(null);
  useImperativeHandle(forwarded, () => {
    const element = ref.current;
    if (!element)
      throw new Error(
        "The field control must be mounted before exposing its ref.",
      );
    return element;
  });
  return { ref, attach: ref };
}
