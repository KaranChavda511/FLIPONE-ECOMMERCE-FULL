import { cn } from "@/lib/utils";
import { Table, TableCell, TableRow } from "@/components/ui/table";

/**
 * Panel around a data table (mock-up `.panel` + `.tbl-wrap`): white surface, 1px rule, 6px radius.
 * The scroll box scrolls both ways, so the header row stays stuck to its top (sticky header).
 *
 * Props: toolbar (node, rendered above the table: use <DataTableToolbar>), footer (node: <DataTableFooter>),
 *        maxHeight (CSS length for the scroll box, default "70vh"; pass "none" to let the page scroll),
 *        label (accessible name for the scroll region), tableClassName.
 * Children: <TableHeader>/<TableBody> from "@/components/ui/table".
 */
export function DataTable({ toolbar, footer, maxHeight = "70vh", label, className, tableClassName, children }) {
  return (
    <section className={cn("min-w-0 overflow-hidden rounded-md border border-line-soft bg-surface", className)} aria-label={label}>
      {toolbar}
      <Table
        containerClassName={cn(
          "overflow-auto overscroll-x-contain",
          // sticky header: every <th> sticks to the top of the scroll box
          "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-[1] [&_thead_th]:shadow-[inset_0_-1px_0_var(--fo-line-soft)]"
        )}
        containerStyle={maxHeight && maxHeight !== "none" ? { maxHeight } : undefined}
        className={tableClassName}
      >
        {children}
      </Table>
      {footer}
    </section>
  );
}

/** Filter/tab row above a table (mock-up `.tabs`): flex row, 10px/12px padding, bottom rule. Put actions in a `ml-auto` div. */
export function DataTableToolbar({ className, children, ...props }) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-1 border-b border-line-soft px-3 py-2.5", className)}
      {...props}
    >
      {children}
    </div>
  );
}

/** Footer row under a table (mock-up `.tbl-foot`): count on the left, pager/actions on the right. */
export function DataTableFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-3.5 py-2.5 text-[13px] text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Single-line cell text with an ellipsis (mock-up `.cust b`, `.item b`). `max` is a CSS width (default "18ch").
 * The full text is kept in `title` for hover.
 */
export function CellText({ children, max = "18ch", strong = false, className, title }) {
  const text = typeof children === "string" || typeof children === "number" ? String(children) : undefined;
  return (
    <span
      className={cn("block truncate", strong && "font-medium text-ink", className)}
      style={{ maxWidth: max }}
      title={title ?? text}
    >
      {children}
    </span>
  );
}

/** Muted secondary line inside a cell (e.g. city under a customer name). */
export function CellSub({ className, ...props }) {
  return <small className={cn("block text-[12.5px] text-muted-foreground", className)} {...props} />;
}

/** A body row that spans all columns, for loading/empty/error states. */
export function DataTableMessage({ colSpan, className, children }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className={cn("h-auto py-10 text-center whitespace-normal", className)}>
        {children}
      </TableCell>
    </TableRow>
  );
}
