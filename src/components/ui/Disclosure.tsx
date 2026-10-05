/** Native details/summary disclosure with a plus icon that turns into a cross when open. */
import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export type DisclosureProps = {
  className: string;
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  iconSize?: number;
  iconStrokeWidth?: number;
};

export default function Disclosure({
  className,
  summary,
  children,
  defaultOpen = false,
  iconSize = 23,
  iconStrokeWidth = 1.25,
}: DisclosureProps) {
  return (
    <details className={`disclosure ${className}`} open={defaultOpen}>
      <summary>
        {summary}
        <Plus
          className="disclosure-icon"
          size={iconSize}
          strokeWidth={iconStrokeWidth}
          aria-hidden="true"
        />
      </summary>
      {children}
    </details>
  );
}
