/** Copies text to the clipboard and reports the outcome, resetting after a few seconds. */
import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copying" | "copied" | "error";

const resetDelay = 4000;

export default function useClipboardCopy(text: string) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = useCallback(async () => {
    clearTimeout(resetTimer.current);
    setStatus("copying");
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
    resetTimer.current = setTimeout(() => setStatus("idle"), resetDelay);
  }, [text]);

  return { status, copy };
}
