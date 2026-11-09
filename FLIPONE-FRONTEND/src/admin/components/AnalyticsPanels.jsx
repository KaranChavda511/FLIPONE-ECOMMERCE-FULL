import { useId, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import { formatNumber } from "@/lib/format";
import {
  LazyChart,
  TABLE_COLUMNS,
  barListHeight,
  categoryBars,
  count,
  dailySummary,
  hasValues,
  inr,
  rankSummary,
  signupLines,
  topList,
} from "@/components/charts";
import { StatusMeterList } from "@/components/flipone";
import { Button } from "@/components/ui/button";
import { Panel } from "./Panel";
import FilterTabs from "./FilterTabs";

/*
 * The dashboard's secondary panels. Each one takes the API rows from the page (which owns the requests)
 * and renders a titled Panel with a one-line caption saying what the figures cover.
 */

const BAR_LIMIT = 6;
/* Height of an empty / error / loading bar list, and of the daily sign-up bars. */
const SMALL_CHART_HEIGHT = 200;
const plural = (n, one, many) => `${formatNumber(n)} ${n === 1 ? one : many}`;
/* Bar lists are as tall as their rows (34px each), so a short list never leaves an empty plot. */
const listHeight = (n, loading) => (loading || n === 0 ? SMALL_CHART_HEIGHT : barListHeight(n));

/* ---------- order status (stamps + 1px meters) ---------- */

const UNIT_OPTIONS = [
  { value: "orders", label: "Orders" },
  { value: "items", label: "Items" },
];

/**
 * counts: GET /api/admin/analytics/order-status ({ orders, items }), all time. Orders by default; "Items"
 * switches to the per-item counts (sellers move items one by one, so items show where the work is).
 * In "Orders", each row filters the latest-orders table (`selected` / `onSelect`).
 */
export function OrderStatusPanel({ counts, loading, error, onRetry, selected, onSelect, className }) {
  const titleId = useId();
  const [unit, setUnit] = useState("orders");
  const isOrders = unit === "orders";

  return (
    <Panel
      title={isOrders ? "Orders by status" : "Items by status"}
      titleId={titleId}
      caption={isOrders ? "All time" : "All time · per order line"}
      actions={<FilterTabs label="Count" options={UNIT_OPTIONS} value={unit} onChange={setUnit} />}
      className={className}
      bodyClassName="pb-1"
    >
      {error && !loading ? (
        <div role="alert" className="flex flex-col items-start gap-3 px-4.5 py-5 text-[14px]">
          <p className="text-ink-2">
            <span className="font-semibold text-danger">Could not load the status counts.</span> {error}
          </p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCw aria-hidden="true" />
              Try again
            </Button>
          )}
        </div>
      ) : (
        <StatusMeterList
          variant="plain"
          counts={counts?.[unit]}
          unit={unit}
          loading={loading}
          selected={isOrders ? selected : undefined}
          onSelect={isOrders ? onSelect : undefined}
        />
      )}
    </Panel>
  );
}

/* ---------- revenue by category ---------- */

/** rows: GET /api/admin/analytics/categories (`categories`, sorted by revenue). Top 6 by item revenue. */
export function CategoryPanel({ rows, loading, error, onRetry, className }) {
  const titleId = useId();
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const option = useMemo(() => categoryBars(list, { limit: BAR_LIMIT }), [list]);
  const shown = Math.min(list.length, BAR_LIMIT);

  return (
    <Panel
      title="Revenue by category"
      titleId={titleId}
      caption="All time · cancelled items excluded"
      meta={!loading && !error && list.length > BAR_LIMIT ? `Top ${shown} of ${list.length}` : undefined}
      className={className}
      bodyClassName="px-[18px] py-3"
    >
      <LazyChart
        option={option}
        height={listHeight(shown, loading)}
        ariaLabel="Item revenue by category"
        summary={rankSummary(list, { valueKey: "revenue", labelKey: "category" })}
        table={{ columns: TABLE_COLUMNS.categories, rows: list }}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!hasValues(list, ["revenue"])}
        emptyTitle="No category sales yet"
        emptyBody="Categories appear here once their products sell."
      />
    </Panel>
  );
}

/* ---------- top sellers ---------- */

const SELLER_COLUMNS = [
  { key: "sellerName", label: "Seller", format: (v) => String(v ?? "Other") },
  { key: "totalRevenue", label: "Revenue", format: inr },
  { key: "totalQuantitySold", label: "Units sold", format: count },
  { key: "orderCount", label: "Orders", format: count },
];

/** rows: GET /api/admin/analytics/seller-sells (`stats`, sorted by revenue). Top 6 by item revenue. */
export function TopSellersPanel({ rows, loading, error, onRetry, className }) {
  const titleId = useId();
  const list = useMemo(() => (Array.isArray(rows) ? rows : []), [rows]);
  const top = useMemo(() => list.slice(0, BAR_LIMIT), [list]);
  const option = useMemo(() => topList(list, "totalRevenue", { labelKey: "sellerName", limit: BAR_LIMIT }), [list]);

  return (
    <Panel
      title="Top sellers by revenue"
      titleId={titleId}
      caption="All time · cancelled items excluded"
      meta={!loading && !error && list.length > BAR_LIMIT ? `Top ${BAR_LIMIT} of ${list.length}` : undefined}
      className={className}
      bodyClassName="px-[18px] py-3"
    >
      <LazyChart
        option={option}
        height={listHeight(top.length, loading)}
        ariaLabel={`Top ${top.length || BAR_LIMIT} sellers by item revenue`}
        summary={rankSummary(list, { valueKey: "totalRevenue", labelKey: "sellerName" })}
        table={{ columns: SELLER_COLUMNS, rows: top }}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!hasValues(list, ["totalRevenue"])}
        emptyTitle="No seller sales yet"
        emptyBody="Sellers appear here once their items sell."
      />
    </Panel>
  );
}

/* ---------- sign-ups ---------- */

/**
 * daily: GET /api/admin/analytics/growth?days= (`daily`: [{ date, users, sellers }], zero-filled).
 * Daily grouped bars (shoppers ink, sellers grey) with the legend top-left; period totals in the header.
 */
export function GrowthPanel({ daily, days, loading, error, onRetry, className }) {
  const titleId = useId();
  const rows = useMemo(() => (Array.isArray(daily) ? daily : []), [daily]);
  const option = useMemo(() => signupLines(rows), [rows]);
  const shoppers = rows.reduce((total, row) => total + (Number(row?.users) || 0), 0);
  const sellers = rows.reduce((total, row) => total + (Number(row?.sellers) || 0), 0);

  return (
    <Panel
      title="New shoppers and sellers"
      titleId={titleId}
      caption={`Sign-ups per day, last ${days} days · India time`}
      meta={
        !loading && !error && rows.length > 0
          ? `${plural(shoppers, "shopper", "shoppers")} · ${plural(sellers, "seller", "sellers")}`
          : undefined
      }
      className={className}
      bodyClassName="px-[18px] py-3"
    >
      <LazyChart
        option={option}
        height={SMALL_CHART_HEIGHT}
        ariaLabel={`New shoppers and sellers per day, last ${days} days`}
        summary={`${dailySummary(rows, { key: "users", label: "New shoppers" })} ${dailySummary(rows, {
          key: "sellers",
          label: "New sellers",
        })}`}
        table={{ columns: TABLE_COLUMNS.signups, rows }}
        loading={loading}
        error={error}
        onRetry={onRetry}
        empty={!hasValues(rows, ["users", "sellers"])}
        emptyTitle={`No sign-ups in the last ${days} days`}
        emptyBody="New shopper and seller accounts show up here by the day they joined."
      />
    </Panel>
  );
}
