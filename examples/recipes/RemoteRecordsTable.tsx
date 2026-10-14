"use client";
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import {
  createColumnHelper,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { Button, Table, TextField } from "@abuzareal/contour-ui";
import { useRemoteResource, type Loader } from "./useRemoteResource.js";

export type RecordRow = { id: string; name: string; owner: string };
export type RecordsQuery = {
  filter: string;
  sorting: SortingState;
  pagination: PaginationState;
};
export type RecordsPage = {
  rows: readonly RecordRow[];
  total: number;
  unfilteredTotal: number;
};
export type LoadRecords = Loader<RecordsQuery, RecordsPage>;
const features = tableFeatures({ rowSortingFeature, rowPaginationFeature });
const column = createColumnHelper<typeof features, RecordRow>();
const columns = column.columns([
  column.accessor("name", { header: "Name" }),
  column.accessor("owner", { header: "Owner" }),
]);

/** Validate parsed JSON at the application's service boundary before giving it to this recipe. */
export function parseRecordsPage(
  value: unknown,
  pageSize: number,
): RecordsPage {
  if (
    !value ||
    typeof value !== "object" ||
    !("rows" in value) ||
    !Array.isArray(value.rows) ||
    !("total" in value) ||
    !("unfilteredTotal" in value)
  )
    throw new Error("Invalid records response");
  const { rows, total, unfilteredTotal } = value;
  if (
    typeof total !== "number" ||
    !Number.isSafeInteger(total) ||
    total < 0 ||
    typeof unfilteredTotal !== "number" ||
    !Number.isSafeInteger(unfilteredTotal) ||
    unfilteredTotal < total ||
    rows.length > pageSize ||
    rows.length > total
  )
    throw new Error("Invalid records count");
  const ids = new Set<string>();
  const parsed: RecordRow[] = rows.map((row: unknown) => {
    if (
      !row ||
      typeof row !== "object" ||
      !("id" in row) ||
      typeof row.id !== "string" ||
      !row.id ||
      ids.has(row.id) ||
      !("name" in row) ||
      typeof row.name !== "string" ||
      !("owner" in row) ||
      typeof row.owner !== "string"
    )
      throw new Error("Invalid record");
    ids.add(row.id);
    return { id: row.id, name: row.name, owner: row.owner };
  });
  return { rows: parsed, total, unfilteredTotal };
}

/** The service performs sorting/filtering/pagination. This is not local DataTable sorting. */
export function RemoteRecordsTable({
  loadRecords,
}: {
  loadRecords: LoadRecords;
}) {
  const queryAtom = useCreateAtom<RecordsQuery>({
    filter: "",
    sorting: [],
    pagination: { pageIndex: 0, pageSize: 10 },
  });
  const query = useSelector(queryAtom);
  const result = useRemoteResource(query, loadRecords);
  const page = result.data;
  const applied = result.appliedQuery;
  const table = useTable({
    features,
    columns,
    data: page?.rows ?? [],
    getRowId: (row) => row.id,
    manualSorting: true,
    manualPagination: true,
    rowCount: page?.total ?? 0,
    state: { sorting: query.sorting, pagination: query.pagination },
    onSortingChange: (update) =>
      queryAtom.set((previous) => ({
        ...previous,
        sorting: functionalUpdate(update, previous.sorting),
        pagination: { ...previous.pagination, pageIndex: 0 },
      })),
    onPaginationChange: (update) =>
      queryAtom.set((previous) => ({
        ...previous,
        pagination: functionalUpdate(update, previous.pagination),
      })),
  });
  const showingPrevious = !!applied && applied !== query;
  const canPage =
    !!page && !result.loading && !result.error && !showingPrevious;
  return (
    <section aria-label="Remote records">
      <TextField
        label="Filter records"
        value={query.filter}
        onChange={(event) =>
          queryAtom.set((previous) => ({
            ...previous,
            filter: event.target.value,
            pagination: { ...previous.pagination, pageIndex: 0 },
          }))
        }
      />
      <p role="status">
        {result.loading
          ? page
            ? "Loading requested records; previous results remain below."
            : "Loading records…"
          : result.error
            ? "Requested records are unavailable."
            : `${page?.total ?? 0} records found.`}
      </p>
      {result.error && (
        <div role="alert">
          <p>
            {result.error === "permission"
              ? "You do not have permission to view these records."
              : "Records could not be loaded. Previous results have not been replaced."}
          </p>
          <Button onClick={result.retry}>Retry records</Button>
        </div>
      )}
      {page && applied && result.error !== "permission" && (
        <>
          <p>
            Displayed results: page {applied.pagination.pageIndex + 1}, filter{" "}
            {applied.filter ? `“${applied.filter}”` : "none"}, sort{" "}
            {applied.sorting
              .map(
                (sort) =>
                  `${sort.id} ${sort.desc ? "descending" : "ascending"}`,
              )
              .join(", ") || "service default"}
            .
            {showingPrevious
              ? " These are previous results, not the requested result set."
              : ""}
          </p>
          <Table
            caption="Records returned by the service"
            aria-busy={result.loading || undefined}
          >
            <thead>
              <tr>
                {table.getHeaderGroups()[0]?.headers.map((header) => {
                  const sort = applied.sorting.find(
                    (sort) => sort.id === header.column.id,
                  );
                  return (
                    <th
                      scope="col"
                      key={header.id}
                      aria-sort={
                        sort ? (sort.desc ? "descending" : "ascending") : "none"
                      }
                    >
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
          {!page.rows.length && (
            <p>
              {page.unfilteredTotal === 0
                ? "No records exist yet."
                : page.total === 0
                  ? "No records match this filter."
                  : "This page no longer exists. Return to the first page."}
            </p>
          )}
          <Button
            disabled={!canPage || query.pagination.pageIndex === 0}
            onClick={() => table.previousPage()}
          >
            Previous page
          </Button>
          <Button
            disabled={
              !canPage ||
              (query.pagination.pageIndex + 1) * query.pagination.pageSize >=
                page.total
            }
            onClick={() => table.nextPage()}
          >
            Next page
          </Button>
          {page.total > 0 && !page.rows.length && (
            <Button
              onClick={() =>
                queryAtom.set((previous) => ({
                  ...previous,
                  pagination: { ...previous.pagination, pageIndex: 0 },
                }))
              }
            >
              First page
            </Button>
          )}
        </>
      )}
      <p>
        This recipe has no selection, bulk actions, virtualization or adjustable
        density. Add those application contracts before enabling their
        table-engine features.
      </p>
    </section>
  );
}
