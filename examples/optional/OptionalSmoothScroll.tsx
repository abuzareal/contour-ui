"use client";
import { lazy, Suspense, useState } from "react";
import { useMotionPreference } from "@abuzareal/contour-ui";
const SmoothScrollOwner = lazy(() => import("./SmoothScrollOwner.js"));
/** Mount at most one owner for the page; ordinary native scrolling works before opt-in. */
export function OptionalSmoothScroll() {
  const [enabled, setEnabled] = useState(false);
  const reducedMotion = useMotionPreference();
  return (
    <>
      <button
        type="button"
        aria-pressed={enabled}
        onClick={() => setEnabled((value) => !value)}
      >
        Smooth scrolling
      </button>
      {enabled && !reducedMotion && (
        <Suspense fallback={null}>
          <SmoothScrollOwner enabled />
        </Suspense>
      )}
    </>
  );
}
