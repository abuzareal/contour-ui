"use client";
import { useCallback, useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "@abuzareal/contour-ui";
import { useRemoteResource, type Loader } from "./useRemoteResource.js";

export type ProjectSearch = Loader<string, readonly ComboboxOption[]>;
export type AsyncProjectPickerProps = {
  /** Stable function: validate response IDs/labels before resolving. */
  searchProjects: ProjectSearch;
  initialProject?: ComboboxOption;
  onProjectChange?: (project: ComboboxOption | null) => void;
};

/** Copy this into the application; fetching and selected-record retention are not library features. */
export function AsyncProjectPicker({
  searchProjects,
  initialProject,
  onProjectChange,
}: AsyncProjectPickerProps) {
  const [query, setQuery] = useState(initialProject?.label ?? "");
  const [selected, setSelected] = useState<ComboboxOption | null>(
    initialProject ?? null,
  );
  const search = useCallback(
    async (text: string, signal: AbortSignal) => {
      const matches = await searchProjects(text, signal);
      if (!signal.aborted)
        setSelected((previous) =>
          previous
            ? (matches.find((option) => option.value === previous.value) ??
              previous)
            : null,
        );
      return matches;
    },
    [searchProjects],
  );
  const result = useRemoteResource(query, search);
  // Never display the previous query's rows as if they matched this query.
  const matches = useMemo(
    () =>
      !result.loading && !result.error && result.appliedQuery === query
        ? (result.data ?? [])
        : [],
    [result.loading, result.error, result.appliedQuery, result.data, query],
  );
  // Bounded retention: keep the current result set and one selected record, not an unbounded cache.
  const options = useMemo(
    () =>
      selected && !matches.some((option) => option.value === selected.value)
        ? [...matches, selected]
        : matches,
    [matches, selected],
  );
  return (
    <Combobox
      label="Project"
      name="project"
      required
      options={options}
      filteredOptions={matches}
      value={selected?.value ?? null}
      onValueChange={(value) => {
        const next = options.find((option) => option.value === value) ?? null;
        setSelected(next);
        onProjectChange?.(next);
      }}
      inputValue={query}
      onInputValueChange={setQuery}
      loading={result.loading}
      searchError={
        result.error === "permission"
          ? "You do not have permission to search projects."
          : result.error
            ? "Projects could not be loaded. Try again."
            : undefined
      }
      onRetry={result.retry}
      hint="Choose a project from the results. Typed text is not a submitted project."
    />
  );
}
