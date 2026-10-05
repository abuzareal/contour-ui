/** Number that counts up the first time it scrolls into view; screen readers get the final value. */
import { useEffect, useRef, useState } from "react";
import { motionDisabledFor } from "../../lib/motion.js";

export type CountUpProps = {
  to: number;
  /** Milliseconds for the count. */
  duration?: number;
  /** Pads to this many digits, e.g. 2 renders 05. */
  digits?: number;
  suffix?: string;
};

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3;

export default function CountUp({
  to,
  duration = 1400,
  digits = 0,
  suffix = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (motionDisabledFor(element) || duration <= 0) {
      setCurrent(to);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (motionDisabledFor(element)) {
        setCurrent(to);
        observer.disconnect();
        return;
      }
      observer.disconnect();
      const start = performance.now();
      const tick = (time: number) => {
        if (motionDisabledFor(element)) {
          setCurrent(to);
          return;
        }
        const progress = Math.min((time - start) / duration, 1);
        setCurrent(Math.round(easeOutCubic(progress) * to));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  const format = (value: number) =>
    `${String(value).padStart(digits, "0")}${suffix}`;
  return (
    <span ref={ref} className="count-up">
      <span aria-hidden="true">{format(current)}</span>
      <span className="visually-hidden">{format(to)}</span>
    </span>
  );
}
