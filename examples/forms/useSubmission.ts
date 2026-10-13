"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldErrors, SaveSettings, Settings } from "./settings.js";

type Submission = {
  status: "idle" | "pending" | "error" | "success";
  message: string;
  fields: FieldErrors;
};
const ready: Submission = { status: "idle", message: "", fields: {} };

/** Application example: the injected adapter confirms success; cancellation cannot undo server work. */
export default function useSubmission(save: SaveSettings) {
  const active = useRef<AbortController | null>(null);
  const [submission, setSubmission] = useState(ready);
  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );
  const cancel = useCallback(() => {
    const wasPending = active.current !== null;
    active.current?.abort();
    active.current = null;
    setSubmission({
      ...ready,
      message: wasPending
        ? "Stopped waiting for the response. The server may still finish this request."
        : "",
    });
  }, []);
  const validationFailed = useCallback(() => {
    if (!active.current)
      setSubmission({
        ...ready,
        status: "error",
        message: "Check the highlighted fields.",
      });
  }, []);
  const run = async (settings: Settings) => {
    if (active.current) return null;
    const operation = new AbortController();
    active.current = operation;
    setSubmission({
      status: "pending",
      message: "Saving settings…",
      fields: {},
    });
    try {
      const result = await save(settings, operation.signal);
      if (active.current !== operation || operation.signal.aborted) return null;
      const next: Submission = result.ok
        ? { status: "success", message: "Settings saved.", fields: {} }
        : {
            status: "error",
            message: result.message,
            fields: result.fields ?? {},
          };
      setSubmission(next);
      return next;
    } catch {
      if (active.current !== operation || operation.signal.aborted) return null;
      const next: Submission = {
        status: "error",
        message: "Could not save settings. Try again.",
        fields: {},
      };
      setSubmission(next);
      return next;
    } finally {
      if (active.current === operation) active.current = null;
    }
  };
  return { ...submission, run, cancel, validationFailed };
}
