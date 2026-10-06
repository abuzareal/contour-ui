/** Open state for the mobile menu, closing on Escape, outside pointer, or desktop resize. */
import { useEffect, useState, type RefObject } from "react";

const desktopQuery = "(min-width: 768px)";

export default function useMobileMenu(
  container: RefObject<HTMLElement | null>,
  toggleButton: RefObject<HTMLButtonElement | null>,
) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleButton.current?.focus();
    };
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const desktop = window.matchMedia(desktopQuery);
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [open, container, toggleButton]);

  return [open, setOpen] as const;
}
