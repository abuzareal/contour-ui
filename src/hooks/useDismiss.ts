/** Calls onDismiss on Escape or a pointer press outside the container while `active`. */
import { useEffect, type RefObject } from "react";

export default function useDismiss(
  container: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: (reason: "escape" | "outside") => void,
) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss("escape");
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node))
        onDismiss("outside");
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [container, active, onDismiss]);
}
