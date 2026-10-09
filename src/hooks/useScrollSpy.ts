"use client";

/** Returns the id of the last listed element whose top has scrolled past the activation line. */
import { useEffect, useState } from "react";

/** Fraction of the viewport height at which an element becomes "current". */
const activationLine = 0.3;

export default function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState("");
  const key = ids.join("|");

  useEffect(() => {
    const elements = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const line = window.innerHeight * activationLine;
        let current = "";
        elements.forEach((element) => {
          if (element.getBoundingClientRect().top <= line) current = element.id;
        });
        setActiveId(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [key]);

  return activeId;
}
