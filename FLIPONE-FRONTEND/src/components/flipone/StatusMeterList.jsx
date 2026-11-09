import { useId } from "react";
import { cn } from "@/lib/utils";
import { capitalize, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import Stamp from "./Stamp";

const STATUSES = ["pending", "shipped", "delivered", "cancelled"];

/* Meter fill in the stamp's own colour token. Cancelled is danger #9E1B32, never tag red. */
const FILL = {
  pending: "bg-warning",
  shipped: "bg-ink",
  delivered: "bg-success",
  cancelled: "bg-danger",
};

const toCount = (value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** "1 order", "35 orders", "1 item". */
const noun = (n, unit) => (n === 1 ? unit.replace(/s$/, "") : unit);

/** Share as a whole percent; a non-zero share under 0.5% reads "<1%" rather than a false "0%". */
const sharePercent = (n, total) => {
  if (!total) return "—";
  const share = (n / total) * 100;
  if (n > 0 && share < 0.5) return "<1%";
  return `${Math.round(share)}%`;
};

/**
 * Orders (or order items) by status: one row per status with the real Stamp, a 1px meter in the status's
 * colour, the tabular count and its share. Mock-up: admin dashboard "Orders by status" (`.st-list`).
 *
 * Props:
 *  counts: { pending, shipped, delivered, cancelled } (missing or invalid values count as 0)
 *  unit: 'orders' | 'items' (default 'orders')
 *  title: optional heading (e.g. "Orders by status"); headingLevel default 'h2'
 *  totalLabel: replaces the generated total line ("35 orders · incl. 1 cancelled")
 *  qualifier: appended to the total line ("last 30 days")
 *  caption: muted footnote under the list (e.g. "Each order item counts once.")
 *  onSelect: (status) => void; rows become toggle buttons (e.g. to filter a table)
 *  selected: the status currently selected (aria-pressed on its row)
 *  loading: skeleton counts
 *  variant: 'panel' (white surface, 1px rule; default) | 'plain' (no frame, inside an existing panel)
 */
export default function StatusMeterList({
  counts,
  unit = "orders",
  title,
  headingLevel: Heading = "h2",
  totalLabel,
  qualifier,
  caption,
  onSelect,
  selected,
  loading = false,
  variant = "panel",
  className,
}) {
  const headingId = useId();
  const source = counts && typeof counts === "object" ? counts : {};
  const values = Object.fromEntries(STATUSES.map((status) => [status, toCount(source[status])]));
  const total = STATUSES.reduce((sum, status) => sum + values[status], 0);
  const cancelled = values.cancelled;

  const generated = [
    `${formatNumber(total)} ${noun(total, unit)}`,
    cancelled > 0 ? `incl. ${formatNumber(cancelled)} cancelled` : null,
    qualifier || null,
  ]
    .filter(Boolean)
    .join(" · ");
  const totalLine = totalLabel ?? generated;
  const listLabel = title ? undefined : `${capitalize(unit)} by status`;

  return (
    <section
      data-slot="status-meter-list"
      aria-labelledby={title ? headingId : undefined}
      aria-label={listLabel}
      aria-busy={loading || undefined}
      className={cn(variant === "panel" && "rounded-md border border-line-soft bg-surface", className)}
    >
      <div
        className={cn(
          "flex flex-wrap items-baseline gap-x-3 gap-y-1",
          title ? "justify-between border-b border-line-soft px-4.5 py-3.5" : "px-4 pt-3 pb-1"
        )}
      >
        {title && (
          <Heading id={headingId} className="text-[15px] leading-snug font-semibold text-ink">
            {title}
          </Heading>
        )}
        {loading ? (
          <Skeleton className="h-4 w-28" />
        ) : (
          <p className="tabular text-[13px] text-muted-foreground">{totalLine}</p>
        )}
      </div>

      <ul className="flex flex-col">
        {STATUSES.map((status) => {
          const n = values[status];
          const pct = sharePercent(n, total);
          const width = total ? (n / total) * 100 : 0;
          const spoken = `${capitalize(status)}: ${formatNumber(n)} ${noun(n, unit)}${total ? `, ${pct} of ${formatNumber(total)}` : ""}`;

          const row = (
            <>
              <span className="sr-only">{loading ? `${capitalize(status)}: loading` : spoken}</span>
              <Stamp status={status} aria-hidden="true" className="min-w-24 justify-center" />
              <span aria-hidden="true" className="relative h-px min-w-6 flex-1 bg-line-soft">
                {!loading && n > 0 && (
                  <span
                    data-slot="status-meter-fill"
                    className={cn("absolute inset-y-0 left-0", FILL[status])}
                    style={{ width: `${width}%`, minWidth: 2 }}
                  />
                )}
              </span>
              {loading ? (
                <Skeleton className="h-4.5 w-14" />
              ) : (
                <span aria-hidden="true" className="flex items-baseline gap-2">
                  <b className="min-w-10 text-right font-display text-[18px] leading-none font-semibold tabular text-ink">
                    {formatNumber(n)}
                  </b>
                  <span className="w-[4.5ch] text-right text-[12.5px] leading-none tabular text-muted-foreground">
                    {pct}
                  </span>
                </span>
              )}
            </>
          );

          const rowClass = "flex min-h-11 w-full items-center gap-2.5 px-4 py-2.5 text-left";

          return (
            <li key={status} data-status={status} className="border-t border-line-soft first:border-t-0">
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(status)}
                  aria-pressed={selected === status}
                  disabled={loading}
                  className={cn(
                    rowClass,
                    "transition-colors duration-150 ease-out-quint hover:bg-row-hover disabled:cursor-default",
                    selected === status && "bg-paper-2 hover:bg-paper-2"
                  )}
                >
                  {row}
                </button>
              ) : (
                <div className={rowClass}>{row}</div>
              )}
            </li>
          );
        })}
      </ul>

      {caption && (
        <p className="border-t border-line-soft px-4 py-2.5 text-[12.5px] leading-snug text-muted-foreground">{caption}</p>
      )}
    </section>
  );
}
