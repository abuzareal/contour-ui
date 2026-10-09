"use client";

import { useCallback, useState } from "react";

/** Controlled and uncontrolled disclosure state share the same change contract. */
export default function useOpenState(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange?: (open: boolean) => void,
) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const current = open ?? internalOpen;
  const change = useCallback(
    (next: boolean) => {
      if (next === current) return;
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [current, open, onOpenChange],
  );
  return [current, change] as const;
}
