"use client";

/** Editorial data table with mono headers, optional column sorting, and horizontal scroll on small screens. */
import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

export type TableColumn<Row> = {
  key: keyof Row & string;
  header: string;
  align?: "start" | "end";
  sortable?: boolean;
  render?: (row: Row) => ReactNode;
};

export type DataTableProps<Row> = {
  caption: string;
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey: keyof Row & string;
};

type Sort = { key: string; direction: "ascending" | "descending" } | null;

export default function DataTable<Row extends Record<string, string | number>>({
  caption,
  columns,
  rows,
  rowKey,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<Sort>(null);

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const factor = sort.direction === "ascending" ? 1 : -1;
    return [...rows].sort((a, b) =>
      a[sort.key] > b[sort.key]
        ? factor
        : a[sort.key] < b[sort.key]
          ? -factor
          : 0,
    );
  }, [rows, sort]);

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key && current.direction === "ascending"
        ? { key, direction: "descending" }
        : { key, direction: "ascending" },
    );

  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="data-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead className="mono">
          <tr>
            {columns.map((column) => {
              const direction =
                sort?.key === column.key ? sort.direction : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={
                    column.sortable ? (direction ?? "none") : undefined
                  }
                  data-align={column.align}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.header}
                      {direction === "descending" ? (
                        <ArrowDown size={12} aria-hidden="true" />
                      ) : (
                        <ArrowUp
                          size={12}
                          aria-hidden="true"
                          className={direction ? undefined : "data-table-idle"}
                        />
                      )}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={String(row[rowKey])}>
              {columns.map((column) => (
                <td key={column.key} data-align={column.align}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
