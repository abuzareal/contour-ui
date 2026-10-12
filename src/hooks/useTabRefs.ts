"use client";

import { useMemo, type RefObject } from "react";
import { composeRefs } from "../lib/composeRefs.js";
import type { TabItem } from "../components/ui/Tabs.js";

/** Keep ID-based internal focus targets and caller button refs in the same lifecycle. */
export default function useTabRefs(
  tabs: TabItem[],
  targets: RefObject<Map<string, HTMLButtonElement>>,
) {
  return useMemo(
    () =>
      tabs.map((tab) =>
        composeRefs<HTMLButtonElement>((element) => {
          if (element) targets.current?.set(tab.id, element);
          else targets.current?.delete(tab.id);
        }, tab.buttonProps?.ref),
      ),
    [tabs, targets],
  );
}
