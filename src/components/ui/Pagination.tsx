"use client";

/** Page navigation with previous/next controls and a condensed list of two-digit page numbers. */
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatIndex } from "../../lib/format.js";

export type PaginationProps = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
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
}: PaginationProps) {
  return (
    <nav aria-label={label} className="pagination">
      <button
        type="button"
        className="pagination-step"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <ArrowLeft size={16} />
      </button>
      <ol className="mono">
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden="true"
              className="pagination-gap"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="pagination-page"
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onChange(Number(item))}
              >
                {formatIndex(Number(item))}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className="pagination-step"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onChange(page + 1)}
      >
        <ArrowRight size={16} />
      </button>
    </nav>
  );
}
