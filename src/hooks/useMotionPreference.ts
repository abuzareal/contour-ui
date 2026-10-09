"use client";

/** Tracks the user's `prefers-reduced-motion` setting and updates when it changes. */
import { useEffect, useState } from "react";

const query = "(prefers-reduced-motion: reduce)";

export default function useMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}
