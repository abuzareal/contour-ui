/** Two-sided card that flips in 3D; a button toggles it so the back is reachable without hover. */
import { useState, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cx } from "../../lib/classNames.js";

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  label: string;
};

export default function FlipCard({ front, back, label }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flip-stage">
      <div className={cx("flip-card", flipped && "is-flipped")}>
        <div
          className="flip-face flip-front"
          aria-hidden={flipped}
          {...(flipped ? { inert: "" } : {})}
        >
          {front}
        </div>
        <div
          className="flip-face flip-back"
          aria-hidden={!flipped}
          {...(!flipped ? { inert: "" } : {})}
        >
          {back}
        </div>
      </div>
      <button
        type="button"
        className="flip-toggle mono"
        aria-pressed={flipped}
        onClick={() => setFlipped((value) => !value)}
      >
        <RefreshCw size={13} aria-hidden="true" />
        {label}
      </button>
    </div>
  );
}
