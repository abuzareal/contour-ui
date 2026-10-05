/** Content card in surface, ink, or acid tones with eyebrow, title, body, and footer slots. */
import type { ReactNode } from "react";
import { cx } from "../../lib/classNames.js";

export type CardProps = {
  title: string;
  children?: ReactNode;
  eyebrow?: string;
  footer?: ReactNode;
  icon?: ReactNode;
  tone?: "surface" | "ink" | "acid";
  /** Lifts on hover; use when the whole card is a link target. */
  interactive?: boolean;
};

export default function Card({
  title,
  children,
  eyebrow,
  footer,
  icon,
  tone = "surface",
  interactive = false,
}: CardProps) {
  return (
    <article
      className={cx("card", `card-${tone}`, interactive && "card-interactive")}
    >
      {(eyebrow || icon) && (
        <div className="card-top mono">
          {eyebrow && <span>{eyebrow}</span>}
          {icon && <span className="card-icon">{icon}</span>}
        </div>
      )}
      <h3 className="card-title">{title}</h3>
      {children && <div className="card-body">{children}</div>}
      {footer && <div className="card-footer">{footer}</div>}
    </article>
  );
}
