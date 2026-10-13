"use client";

/** Open state for the mobile menu, closing on Escape, outside pointer, or desktop resize. */
import useDismiss from "./useDismiss.js";
import { useEffect, useState, type RefObject } from "react";

const desktopQuery = "(min-width: 768px)";

export default function useMobileMenu(
  container: RefObject<HTMLElement | null>,
  toggleButton: RefObject<HTMLButtonElement | null>,
) {
  const [open, setOpen] = useState(false);

  useDismiss(
    container,
    open,
    (reason) => {
      setOpen(false);
      if (reason === "escape" && toggleButton.current?.isConnected)
        toggleButton.current.focus();
    },
    { branches: [toggleButton] },
  );
  useEffect(() => {
    if (!open) return;
    const view = container.current?.ownerDocument.defaultView;
    if (!view) return;
    const desktop = view.matchMedia(desktopQuery);
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => {
      desktop.removeEventListener("change", closeOnDesktop);
    };
  });

  return [open, setOpen] as const;
}
