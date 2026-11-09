import { CircleAlert, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/flipone/EmptyState";

/*
 * The non-ECharts parts of a chart: loading, empty, error and the visually hidden data table.
 * No ECharts import, so LazyChart can show them before the ECharts chunk arrives.
 */

const toCss = (height) => (typeof height === "number" ? `${height}px` : height);

/** Paper-2 block the size of the chart (frozen under reduced motion by index.css). */
export function ChartSkeleton({ height = 280, label, className }) {
  return (
    <div className={cn("relative", className)} style={{ height: toCss(height) }}>
      <Skeleton className="size-full" />
      <span className="sr-only">{label ? `Loading ${label}` : "Loading chart"}</span>
    </div>
  );
}

/** Zero state inside a chart's footprint (no illustration: the panel title already says what is missing). */
export function ChartEmpty({
  height = 280,
  title = "Nothing to chart yet",
  body = "Figures appear here once there is activity in this period.",
  action,
  className,
}) {
  return (
    <div className={cn("grid place-items-center", className)} style={{ minHeight: toCss(height) }}>
      <EmptyState variant="plain" illustration={null} headingLevel="p" title={title} body={body} action={action} />
    </div>
  );
}

/** Load error with the recovery next to it. `onRetry` re-runs the request (shows "Try again"). */
export function ChartError({
  height = 280,
  title = "Could not load these figures",
  body = "Check the connection, then try again.",
  onRetry,
  retryLabel = "Try again",
  className,
}) {
  return (
    <div className={cn("grid place-items-center px-6", className)} style={{ minHeight: toCss(height) }}>
      <div className="flex max-w-[44ch] flex-col items-center text-center">
        <CircleAlert className="size-5 text-danger" strokeWidth={1.75} aria-hidden="true" />
        <p className="mt-2 text-[15px] font-semibold text-ink">{title}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            {retryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Visually hidden table mirroring the chart, for screen readers.
 * columns: [{ key, label, format? }]; rows: the same rows the chart was built from.
 */
export function ChartTable({ caption, columns = [], rows = [] }) {
  if (!columns.length || !rows?.length) return null;
  // sr-only goes on a wrapper div, not the table: tables ignore `height: 1px` and grow to their rows,
  // so a hidden 30-row table stretched the page by ~700px of empty paper.
  return (
    <div className="sr-only">
    <table>
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} scope="col">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.date ?? row._id ?? i}>
            {columns.map((col, c) => {
              const value = col.format ? col.format(row[col.key], row) : String(row[col.key] ?? "");
              return c === 0 ? (
                <th key={col.key} scope="row">
                  {value}
                </th>
              ) : (
                <td key={col.key}>{value}</td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
