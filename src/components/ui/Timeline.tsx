/** Vertical timeline of dated entries joined by a rule, with an acid marker for the current one. */
import { cx } from "../../lib/classNames.js";

export type TimelineProps = {
  entries: { date: string; title: string; body?: string; current?: boolean }[];
};

export default function Timeline({ entries }: TimelineProps) {
  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li
          key={`${entry.date}-${entry.title}`}
          className={cx("timeline-entry", entry.current && "timeline-current")}
        >
          <span className="timeline-date mono">{entry.date}</span>
          <span className="timeline-title">{entry.title}</span>
          {entry.body && <span className="timeline-body">{entry.body}</span>}
        </li>
      ))}
    </ol>
  );
}
