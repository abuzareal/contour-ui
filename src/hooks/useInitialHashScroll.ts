/** Scrolls to the URL fragment after first render; the section does not exist yet when the browser first tries. */
import { useEffect } from "react";

const userScrollEvents = ["wheel", "touchstart", "keydown"] as const;

export default function useInitialHashScroll() {
  useEffect(() => {
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    // Scroll now, then once more after web fonts settle, unless the visitor has scrolled.
    let userScrolled = false;
    const markScrolled = () => (userScrolled = true);
    const align = () => {
      if (!userScrolled) target.scrollIntoView({ block: "start" });
    };
    align();
    userScrollEvents.forEach((event) =>
      window.addEventListener(event, markScrolled, { passive: true }),
    );
    document.fonts.ready.then(align);
    return () =>
      userScrollEvents.forEach((event) =>
        window.removeEventListener(event, markScrolled),
      );
  }, []);
}
