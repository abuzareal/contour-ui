"use client";

/** Enables Lenis smooth scrolling (and animated anchor jumps) while motion is allowed. */
import { useEffect } from "react";
import Lenis from "lenis";

export default function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      // Lenis honours each section's CSS scroll-margin-top, so no extra offset.
      anchors: true,
    });
    return () => lenis.destroy();
  }, [enabled]);
}
