import { ccx } from "../../lib/classNames.js";
/** Section heading whose lines slide up when the surrounding Reveal enters view. */
import type { ReactNode } from "react";

export type HeadingLine = {
  text: ReactNode;
  /** Renders the line in the section's accent colour. */
  accent?: boolean;
};

export type RevealHeadingProps = {
  id: string;
  lines: HeadingLine[];
};

export default function RevealHeading({ id, lines }: RevealHeadingProps) {
  return (
    <h2 id={id}>
      {lines.map((line, index) => (
        <span
          key={index}
          className={ccx(line.accent ? "type-line type-accent" : "type-line")}
        >
          <span className={ccx("type-run")}>{line.text}</span>
        </span>
      ))}
    </h2>
  );
}
