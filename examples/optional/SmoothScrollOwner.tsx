"use client";
import { useSmoothScroll } from "@abuzareal/contour-ui/scroll";
import "lenis/dist/lenis.css";
export default function SmoothScrollOwner({ enabled }: { enabled: boolean }) {
  useSmoothScroll(enabled);
  return null;
}
