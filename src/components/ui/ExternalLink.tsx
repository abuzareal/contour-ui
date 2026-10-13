"use client";

/** Anchor for off-site destinations; always opens a new tab without leaking the opener. */
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { safeHref } from "../../lib/safeHref.js";

export type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "target" | "rel"
>;

const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  function ExternalLink({ href, ...props }: ExternalLinkProps, ref) {
    return (
      <a
        ref={ref}
        {...props}
        href={safeHref(href)}
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  },
);
export default ExternalLink;
