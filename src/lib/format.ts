/** Small formatting helpers shared by UI components. */

/** Formats a 1-based position as a two-digit index, e.g. 3 -> "03". */
export const formatIndex = (value: number) => String(value).padStart(2, "0");
