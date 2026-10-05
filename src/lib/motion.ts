/** Runtime motion checks for JavaScript-driven effects (CSS handles the rest in motion.css). */

/** True when the visitor prefers reduced motion or the page's motion switch is off. */
export const motionDisabledFor = (element: Element) =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  element.closest('[data-motion="off"]') !== null;
