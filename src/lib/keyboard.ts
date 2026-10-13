/** Arrow-key helpers for composite widgets (tabs, segmented controls, menus). */

type Orientation = "horizontal" | "vertical";

const keysFor = (orientation: Orientation) =>
  orientation === "horizontal"
    ? { previous: "ArrowLeft", next: "ArrowRight" }
    : { previous: "ArrowUp", next: "ArrowDown" };

/**
 * Returns the index to move to for an arrow, Home, or End key press,
 * wrapping at both ends, or null when the key is not a navigation key.
 */
export function nextIndexForKey(
  key: string,
  current: number,
  count: number,
  orientation: Orientation = "horizontal",
  direction: "ltr" | "rtl" = "ltr",
): number | null {
  if (count <= 0) return null;
  const keys = keysFor(orientation);
  const { previous, next } =
    orientation === "horizontal" && direction === "rtl"
      ? { previous: keys.next, next: keys.previous }
      : keys;
  if (key === next) return (current + 1) % count;
  if (key === previous) return (current - 1 + count) % count;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  return null;
}
