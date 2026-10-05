/** Headline number with an olive suffix and a mono caption, as in the About facts. */
import type { ReactNode } from "react";

export type StatProps = {
  value: ReactNode;
  label: string;
  suffix?: string;
};

export default function Stat({ value, label, suffix }: StatProps) {
  return (
    <div className="stat">
      <strong>
        {value}
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </strong>
      <span className="mono">{label}</span>
    </div>
  );
}
