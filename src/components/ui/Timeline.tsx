/** Vertical timeline of dated entries joined by a rule, with an acid marker for the current one. */
import { ccx } from "../../lib/classNames.js";

export type TimelineProps = {
  entries: { date: string; title: string; body?: string; current?: boolean }[];
};

export default function Timeline({ entries }: TimelineProps) {
  return (
    <ol className={ccx("timeline")}>
      {entries.map((entry) => (
        <li
          key={`${entry.date}-${entry.title}`}
          className={ccx("timeline-entry", entry.current && "timeline-current")}
        >
          <span className={ccx("timeline-date mono")}>{entry.date}</span>
          <span className={ccx("timeline-title")}>{entry.title}</span>
          {entry.body && (
            <span className={ccx("timeline-body")}>{entry.body}</span>
          )}
        </li>
      ))}
    </ol>
  );
}
