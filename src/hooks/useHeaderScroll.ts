/** Derives header state from scroll position: scrolled, over a dark area, and the active section. */
import { useEffect, useState, type RefObject } from "react";

/** Fraction of the viewport height at which a section becomes "current". */
const activationLine = 0.35;

export default function useHeaderScroll(header: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false);
  const [overDark, setOverDark] = useState(false);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const sections = [
      ...document.querySelectorAll<HTMLElement>("main section[id]"),
    ];
    const darkAreas = [
      ...document.querySelectorAll<HTMLElement>("[data-header-theme='dark']"),
    ];
    const update = () => {
      setScrolled(window.scrollY > 20);
      const headerBottom = header.current?.offsetHeight ?? 0;
      setOverDark(
        darkAreas.some((area) => {
          const bounds = area.getBoundingClientRect();
          return bounds.top <= headerBottom && bounds.bottom > headerBottom;
        }),
      );
      const line = window.innerHeight * activationLine;
      let current = "";
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      });
      setActiveId(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [header]);

  return { scrolled, overDark, activeId };
}
