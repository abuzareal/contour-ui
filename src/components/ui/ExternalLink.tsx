/** Anchor for off-site destinations; always opens a new tab without leaking the opener. */
import type { AnchorHTMLAttributes } from "react";
import { safeHref } from "../../lib/safeHref.js";

export type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
>;

export default function ExternalLink({ href, ...props }: ExternalLinkProps) {
  return (
    <a
      {...props}
      href={safeHref(href)}
      target="_blank"
      rel="noopener noreferrer"
    />
  );
}
