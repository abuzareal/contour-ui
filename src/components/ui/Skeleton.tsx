/** Shimmering placeholder block shown while content loads. */
import type { CSSProperties } from "react";
import { cx } from "../../lib/classNames.js";

export type SkeletonProps = {
  shape?: "line" | "block" | "circle";
  width?: string;
  height?: string;
};

export default function Skeleton({
  shape = "line",
  width,
  height,
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx("skeleton", `skeleton-${shape}`)}
      style={{ width, height } as CSSProperties}
    />
  );
}
