import { ccx } from "../../lib/classNames.js";
/** Headline number with an olive suffix and a mono caption, as in the About facts. */
import type { ReactNode } from "react";

export type StatProps = {
  value: ReactNode;
  label: string;
  suffix?: string;
};

export default function Stat({ value, label, suffix }: StatProps) {
  return (
    <div className={ccx("stat")}>
      <strong>
        {value}
        {suffix && <span className={ccx("stat-suffix")}>{suffix}</span>}
      </strong>
      <span className={ccx("mono")}>{label}</span>
    </div>
  );
}
