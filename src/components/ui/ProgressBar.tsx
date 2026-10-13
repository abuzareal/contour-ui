/** Thin progress rule (like the opening's acid line); omit `value` for an indeterminate sweep. */
import type { CSSProperties } from "react";
import { ccx } from "../../lib/classNames.js";

export type ProgressBarProps = {
  label: string;
  /** 0–100; leave undefined while the amount of work is unknown. */
  value?: number;
  tone?: "accent" | "success" | "danger";
};

export default function ProgressBar({
  label,
  value,
  tone = "accent",
}: ProgressBarProps) {
  const indeterminate = value === undefined;
  return (
    <div className={ccx("progress", `progress-${tone}`)}>
      <div className={ccx("progress-header mono")}>
        <span>{label}</span>
        {!indeterminate && <span>{Math.round(value)}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : value}
        className={ccx(
          "progress-track",
          indeterminate && "progress-indeterminate",
        )}
        style={{ "--progress": `${value ?? 0}%` } as CSSProperties}
      >
        <span className={ccx("progress-fill")} />
      </div>
    </div>
  );
}
