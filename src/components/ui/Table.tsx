"use client";
import { forwardRef, type TableHTMLAttributes, type ReactNode } from "react";
import type { NativePartProps } from "../../lib/componentProps.js";
import { ccx } from "../../lib/classNames.js";

export type TableProps = Omit<
  TableHTMLAttributes<HTMLTableElement>,
  "children"
> & {
  /** Accessible table name. The component owns the caption element. */
  caption: string;
  children: ReactNode;
  /** Show the caption visually; it remains accessible when false. @default false */
  showCaption?: boolean;
  scrollProps?: NativePartProps<"div">;
};

/** Semantic table styling for application-owned rows, cells and table engines. */
const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  { caption, children, showCaption = false, scrollProps, className, ...rest },
  ref,
) {
  return (
    <div
      {...scrollProps}
      className={ccx("table-scroll", scrollProps?.className)}
      tabIndex={scrollProps?.tabIndex ?? 0}
      role={scrollProps?.role ?? "region"}
      aria-label={scrollProps?.["aria-label"] ?? caption}
    >
      <table {...rest} ref={ref} className={ccx("data-table", className)}>
        <caption className={showCaption ? undefined : ccx("visually-hidden")}>
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
});
export default Table;
