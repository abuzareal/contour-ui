"use client";

/** Pulls its child toward a fine pointer while hovered, then springs back (an awwwards staple). */
import { useRef, type ReactNode } from "react";
import { motionDisabledFor } from "../../lib/motion.js";

export type MagneticProps = {
  children: ReactNode;
  /** Fraction of the pointer offset applied to the child. */
  strength?: number;
};

export default function Magnetic({ children, strength = 0.35 }: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const reset = () => ref.current?.style.removeProperty("--magnet");
  return (
    <span
      ref={ref}
      className="magnetic"
      onPointerMove={(event) => {
        const element = ref.current;
        if (
          !element ||
          event.pointerType !== "mouse" ||
          motionDisabledFor(element)
        )
          return;
        const bounds = element.getBoundingClientRect();
        const x = (event.clientX - bounds.left - bounds.width / 2) * strength;
        const y = (event.clientY - bounds.top - bounds.height / 2) * strength;
        element.style.setProperty("--magnet", `${x}px, ${y}px`);
      }}
      onPointerLeave={reset}
    >
      {children}
    </span>
  );
}
