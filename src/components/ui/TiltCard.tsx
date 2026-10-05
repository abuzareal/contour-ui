/** Card that tilts in 3D toward a fine pointer with a moving glare highlight. */
import { useRef, type ReactNode } from "react";
import { motionDisabledFor } from "../../lib/motion.js";

export type TiltCardProps = {
  children: ReactNode;
  /** Maximum rotation in degrees. */
  maxTilt?: number;
};

export default function TiltCard({ children, maxTilt = 12 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="tilt-stage">
      <div
        ref={ref}
        className="tilt-card"
        onPointerMove={(event) => {
          const element = ref.current;
          if (
            !element ||
            event.pointerType !== "mouse" ||
            motionDisabledFor(element)
          )
            return;
          const bounds = element.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width;
          const y = (event.clientY - bounds.top) / bounds.height;
          element.style.setProperty(
            "--tilt-x",
            `${(0.5 - y) * maxTilt * 2}deg`,
          );
          element.style.setProperty(
            "--tilt-y",
            `${(x - 0.5) * maxTilt * 2}deg`,
          );
          element.style.setProperty("--glare-x", `${x * 100}%`);
          element.style.setProperty("--glare-y", `${y * 100}%`);
        }}
        onPointerLeave={() => {
          ["--tilt-x", "--tilt-y", "--glare-x", "--glare-y"].forEach((name) =>
            ref.current?.style.removeProperty(name),
          );
        }}
      >
        {children}
        <span className="tilt-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
