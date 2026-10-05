/** Endless horizontal ticker of items; pauses on hover and stays still for reduced motion. */
import type { CSSProperties } from "react";
import { Asterisk } from "lucide-react";

export type MarqueeProps = {
  items: string[];
  label: string;
  /** Seconds for one full loop. */
  duration?: number;
};

export default function Marquee({ items, label, duration = 28 }: MarqueeProps) {
  // The track is rendered twice so the loop has no visible seam.
  const track = (hidden: boolean) => (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item}>
          <Asterisk size={18} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="marquee"
      role="region"
      aria-label={label}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="marquee-inner">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
