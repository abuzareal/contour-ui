/** Two-sided card that flips in 3D; a button toggles it so the back is reachable without hover. */
import { useState, version, type HTMLAttributes, type ReactNode } from "react";
import { RefreshCw } from "lucide-react";
import { cx } from "../../lib/classNames.js";

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  label: string;
};

// React 18 treats inert as an unknown string attribute; React 19 treats it as boolean.
const inertAttributes = {
  inert: Number.parseInt(version, 10) >= 19 ? true : "",
} as unknown as HTMLAttributes<HTMLDivElement>;

export default function FlipCard({ front, back, label }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flip-stage">
      <div className={cx("flip-card", flipped && "is-flipped")}>
        <div
          className="flip-face flip-front"
          aria-hidden={flipped}
          {...(flipped ? inertAttributes : {})}
        >
          {front}
        </div>
        <div
          className="flip-face flip-back"
          aria-hidden={!flipped}
          {...(!flipped ? inertAttributes : {})}
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
