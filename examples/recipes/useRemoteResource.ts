"use client";
import { useEffect, useRef, useState } from "react";

/** The application maps its service failures; never display raw server exceptions. */
export class RecipeServiceError extends Error {
  constructor(public readonly kind: "permission" | "service") {
    super(kind);
  }
}
export type Loader<Query, Data> = (
  query: Query,
  signal: AbortSignal,
) => Promise<Data>;

/** Application-owned fetching. The old snapshot stays labelled; obsolete work cannot commit. */
export function useRemoteResource<Query, Data>(
  query: Query,
  load: Loader<Query, Data>,
) {
  const [attempt, setAttempt] = useState(0);
  const sequence = useRef(0);
  const [state, setState] = useState<{
    requested: Query | null;
    loader: Loader<Query, Data> | null;
    attempt: number;
    applied: Query | null;
    data: Data | null;
    error: "permission" | "service" | null;
  }>({
    requested: null,
    loader: null,
    attempt: -1,
    applied: null,
    data: null,
    error: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    const revision = ++sequence.current;
    void (async () => {
      try {
        const data = await load(query, controller.signal);
        if (controller.signal.aborted || sequence.current !== revision) return;
        setState({
          requested: query,
          loader: load,
          attempt,
          applied: query,
          data,
          error: null,
        });
      } catch (error) {
        if (controller.signal.aborted || sequence.current !== revision) return;
        const kind =
          error instanceof RecipeServiceError ? error.kind : "service";
        setState((previous) => ({
          ...previous,
          requested: query,
          loader: load,
          attempt,
          error: kind,
          // A denied snapshot must not reappear while a later query is pending.
          data: kind === "permission" ? null : previous.data,
          applied: kind === "permission" ? null : previous.applied,
        }));
      }
    })();
    return () => controller.abort();
  }, [query, load, attempt]);
  const current =
    state.requested === query &&
    state.loader === load &&
    state.attempt === attempt;
  return {
    data: state.data,
    appliedQuery: state.applied,
    loading: !current,
    error: current ? state.error : null,
    retry: () => setAttempt((n) => n + 1),
  };
}
