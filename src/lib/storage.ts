/** Web Storage helpers that tolerate blocked or throwing storage (private mode, sandboxed frames). */

export const storageKeys = {
  openingSeen: "aa-opening-seen",
  // Also read by the inline theme script in index.html.
  theme: "aa-theme",
} as const;

type StorageArea = "local" | "session";

const getArea = (area: StorageArea) =>
  area === "local" ? window.localStorage : window.sessionStorage;

export function readStorage(area: StorageArea, key: string): string | null {
  try {
    return getArea(area).getItem(key);
  } catch {
    return null;
  }
}

/** Returns false when the value could not be persisted. */
export function writeStorage(
  area: StorageArea,
  key: string,
  value: string,
): boolean {
  try {
    getArea(area).setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
