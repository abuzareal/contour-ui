"use client";

import { safeHref } from "../../lib/safeHref.js";
/** The "aa." monogram; links to the top of the page unless given another href. */

export type BrandMarkProps = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export default function BrandMark({
  label,
  href = "#hero",
  onClick,
}: BrandMarkProps) {
  return (
    <a
      href={safeHref(href)}
      className="brand"
      aria-label={label}
      onClick={onClick}
    >
      aa<span>.</span>
    </a>
  );
}
