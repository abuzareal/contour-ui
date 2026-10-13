"use client";

import { ccx } from "../../lib/classNames.js";

/** Page navigation with previous/next controls and a condensed list of two-digit page numbers. */
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatIndex } from "../../lib/format.js";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number) => string;
  formatPage?: (page: number) => string;
};

/** First, last, and the current page's neighbours; gaps become ellipses. */
function visiblePages(page: number, pageCount: number) {
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b);
  return sorted.flatMap((value, index) =>
    index > 0 && value - sorted[index - 1] > 1 ? ["gap", value] : [value],
  );
}

export default function Pagination({
  page,
  pageCount,
  onChange,
  label = "Pagination",
  previousLabel = "Previous page",
  nextLabel = "Next page",
  pageLabel = (value) => `Page ${value}`,
  formatPage = formatIndex,
}: PaginationProps) {
  return (
    <nav aria-label={label} className={ccx("pagination")}>
      <button
        type="button"
        className={ccx("pagination-step")}
        aria-label={previousLabel}
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={16} />
      </button>
      <ol className={ccx("mono")}>
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className={ccx("pagination-gap")}
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={ccx("pagination-page")}
                aria-label={pageLabel(Number(item))}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onChange(Number(item))}
              >
                {formatPage(Number(item))}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className={ccx("pagination-step")}
        aria-label={nextLabel}
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ArrowRight size={16} />
      </button>
    </nav>
  );
}
