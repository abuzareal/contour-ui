"use client";

/** Copies text to the clipboard and reports the outcome, resetting after a few seconds. */
import { useCallback, useEffect, useRef, useState } from "react";

export type CopyStatus = "idle" | "copying" | "copied" | "error";

const resetDelay = 4000;

export default function useClipboardCopy(text: string) {
  const [feedback, setFeedback] = useState<{ text: string; status: CopyStatus }>({
    text,
    status: "idle",
  });
  // Feedback belongs to the current value, even before effects synchronize.
  if (feedback.text !== text) setFeedback({ text, status: "idle" });
  const status = feedback.text === text ? feedback.status : "idle";
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const active = useRef(false);
  const request = useRef(0);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      request.current += 1;
      clearTimeout(resetTimer.current);
    };
  }, [text]);

  const copy = useCallback(async () => {
    if (!active.current) return;
    const currentRequest = ++request.current;
    clearTimeout(resetTimer.current);
    setFeedback({ text, status: "copying" });
    let outcome: CopyStatus = "copied";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      outcome = "error";
    }
    // Clipboard writes cannot be cancelled; discard obsolete completions.
    if (!active.current || currentRequest !== request.current) return;
    setFeedback({ text, status: outcome });
    resetTimer.current = setTimeout(
      () => setFeedback({ text, status: "idle" }),
      resetDelay,
    );
  }, [text]);

  return { status, copy };
}
