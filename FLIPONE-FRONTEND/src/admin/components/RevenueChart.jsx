import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { formatInr, formatNumber } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { LazyChart, TABLE_COLUMNS, dailySummary, hasValues, revenueOrdersCombo } from "@/components/charts";
import { Panel } from "./Panel";
import FilterTabs from "./FilterTabs";

const PERIODS = [7, 30, 90];
const PERIOD_OPTIONS = PERIODS.map((value) => ({ value, label: `${value} days` }));
/* Full-width panel: a short plot keeps the stat strip and the tables above it in proportion. */
const CHART_HEIGHT = 260;

const sum = (rows, key) => rows.reduce((total, row) => total + (Number(row?.[key]) || 0), 0);

/**
 * Dashboard revenue panel: item revenue per day as ink bars (₹ axis). Orders and units per day are tooltip
 * rows only; their period totals sit in the header next to the revenue total. A 7 / 30 / 90 day switch
 * refetches GET /api/admin/analytics/sales?days=.
 * `daily` is that response's zero-filled [{ date, revenue, units, orders }] (India days, cancelled items out).
 * `refreshing`: the previous period's figures are still on screen while the new period loads.
 */
export default function RevenueChart({ daily, days, onDaysChange, loading, refreshing, error, onRetry, className }) {
  const titleId = useId();
  const rows = useMemo(() => (Array.isArray(daily) ? daily : []), [daily]);
  const option = useMemo(() => revenueOrdersCombo(rows), [rows]);

  const revenue = sum(rows, "revenue");
  const orders = sum(rows, "orders");
  const units = sum(rows, "units");
  const showFigures = !loading && !error && rows.length > 0;

  return (
    <Panel
      title="Revenue by day"
      titleId={titleId}
      caption="Item sales, India time · cancelled items excluded · orders and units per day in the tooltip"
      actions={<FilterTabs label="Period" options={PERIOD_OPTIONS} value={days} onChange={onDaysChange} />}
      className={className}
      bodyClassName="px-[18px] pt-3 pb-3"
    >
      <div aria-busy={refreshing || undefined} className={cn("transition-opacity duration-200", refreshing && "opacity-55")}>
        {/* Period totals: summed from the same daily rows the chart draws. Fixed height so nothing shifts. */}
        <div className="mb-2 flex h-10 items-end gap-x-5 overflow-hidden">
          {loading ? (
            <Skeleton className="h-8 w-56" />
          ) : showFigures ? (
            <>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-[30px] leading-none font-semibold text-ink tabular">{formatInr(revenue)}</span>
                <span className="text-[13px] text-muted-foreground">in the last {days} days</span>
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-[20px] leading-none font-semibold text-ink tabular">{formatNumber(orders)}</span>
                <span className="text-[13px] text-muted-foreground">{orders === 1 ? "order" : "orders"}</span>
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-[20px] leading-none font-semibold text-ink tabular">{formatNumber(units)}</span>
                <span className="text-[13px] text-muted-foreground">{units === 1 ? "unit" : "units"}</span>
              </p>
            </>
          ) : null}
        </div>

        <LazyChart
          option={option}
          height={CHART_HEIGHT}
          ariaLabel={`Revenue per day, last ${days} days`}
          summary={`${dailySummary(rows, { key: "revenue" })} ${dailySummary(rows, { key: "orders" })}`}
          table={{ caption: `Revenue and orders per day, last ${days} days`, columns: TABLE_COLUMNS.revenueOrders, rows }}
          loading={loading}
          error={error}
          onRetry={onRetry}
          empty={!hasValues(rows, ["revenue", "orders"])}
          emptyTitle={`No sales in the last ${days} days`}
          emptyBody={
            days < PERIODS[PERIODS.length - 1]
              ? "Nothing was sold in this period. Try a longer one."
              : "Bars appear here once shoppers place orders."
          }
        />
      </div>
    </Panel>
  );
}
