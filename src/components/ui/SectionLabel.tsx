/** Numbered eyebrow above each content section, e.g. "01 / About". */
import type { Section } from "../../types.js";
import { formatIndex } from "../../lib/format.js";

export type SectionLabelProps = {
  section: Section;
  /** Secondary note shown on the right; hidden on small screens. */
  aside: string;
};

export default function SectionLabel({ section, aside }: SectionLabelProps) {
  return (
    <div className="section-label mono">
      <span>
        {formatIndex(section.number)} / {section.title}
      </span>
      <span>{aside}</span>
    </div>
  );
}
