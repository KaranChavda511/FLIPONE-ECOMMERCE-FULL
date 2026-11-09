# FlipOne charts (ECharts 6, swing-tag theme)

Shared chart layer for the admin and seller dashboards. ECharts is tree-shaken (`echarts/core`) and lives
in its own chunk: it downloads only when a `<LazyChart>` first renders. Nothing here invents figures:
every bar, line, label, tooltip and summary is built from the API rows passed in (see `PRODUCT.md`).

```jsx
import { LazyChart, revenueOrdersCombo, hasValues, dailySummary, TABLE_COLUMNS } from "@/components/charts";
```

## Files

| File | What it is |
| --- | --- |
| `echarts.js` | `echarts.use([...])` registration (Bar, Line, Pie, Grid, Tooltip, Legend, Dataset, SVGRenderer) and the registered `'flipone'` theme. The only file that imports ECharts. |
| `tokens.js` | Palette as plain hex (ECharts cannot read CSS variables), series order, status colours, font stacks. |
| `Chart.jsx` | The React wrapper (default export). Imported only by `LazyChart.jsx`. |
| `LazyChart.jsx` | `lazy(() => import("./Chart.jsx"))` + Skeleton fallback + chunk-load error boundary. **Use this in pages.** |
| `ChartStates.jsx` | `ChartSkeleton`, `ChartEmpty`, `ChartError`, `ChartTable` (no ECharts import). |
| `formatters.js` | `inr`, `compactInr`, `compactNumber`, `count`, `shortDate`, `longDate`, `percent`, `escapeHtml`. |
| `options.js` | Pure option builders + text-alternative helpers. No ECharts import. |
| `index.js` | Barrel. Does **not** export `Chart.jsx` or `echarts.js` (that would pull ECharts into the page chunk). |

Need another series type or component (e.g. `MarkLineComponent`)? Register it in `echarts.js` only.

## `<LazyChart>` props

| Prop | Default | Notes |
| --- | --- | --- |
| `option` | | ECharts option, usually from a builder below. Applied with `setOption(option, { notMerge: true })` on change, so wrap it in `useMemo`. |
| `height` | `280` | px number or CSS length. Skeleton, empty and error states keep the same height (no layout shift). |
| `ariaLabel` | `"Chart"` | Short name, on the `role="img"` container. |
| `summary` | | One or two sentences, visually hidden, linked with `aria-describedby`. Use `dailySummary` / `statusSummary` / `rankSummary`. |
| `table` | | `{ caption?, columns, rows }`: visually hidden data table. Column sets in `TABLE_COLUMNS`. |
| `loading` | `false` | Skeleton of the same height. |
| `error` / `onRetry` | | Error state; `onRetry` adds a "Try again" button that should re-run the request. |
| `empty` / `emptyTitle` / `emptyBody` | `false` | EmptyState. Daily endpoints are zero-filled, so use `hasValues()` rather than `rows.length`. |
| `className` | | On the outer wrapper. |

Behaviour: one instance per mount (theme `flipone`, SVG renderer), `ResizeObserver` resize (rAF-throttled),
`dispose()` on unmount, `animation: false` while `prefers-reduced-motion: reduce` matches (live).

## Builders (`options.js`)

| Builder | Input (API) | Draws |
| --- | --- | --- |
| `revenueOrdersCombo(daily, { revenueLabel?, ordersLabel?, unitsLabel? })` | `[{ date, revenue, orders, units? }]` (`/analytics/sales`, `/api/seller/analytics` `daily`) | Ink revenue bars only (₹ axis, no legend). Orders and units per day appear in the tooltip only (units when the rows carry them); they are not drawn. The old red orders line is gone: between order days it fell to zero and read as a sawtooth. `yAxis` is a one-axis array. |
| `statusDonut(counts, { unit? })` | `{ pending, shipped, delivered, cancelled }` (`/analytics/order-status`) | **Deprecated, kept for compatibility: pages use `StatusMeterList` from `@/components/flipone` instead.** Four-slice donut in stamp colours, total in the centre, counts and shares in the legend. |
| `categoryBars(rows, { valueKey?, labelKey?, limit?, format? })` | `[{ category, revenue, units }]` (`/analytics/categories`) | Horizontal bars, largest first, values as direct labels, no value axis. |
| `topList(rows, valueKey, { labelKey?, limit = 10, format? })` | e.g. `[{ sellerName, totalRevenue, totalQuantitySold, orderCount }]` | Top N horizontal bars; label field auto-detected (`name`, `sellerName`, `productName`, `title`, `category`, `label`). |
| `signupLines(daily, { usersLabel?, sellersLabel? })` | `[{ date, users, sellers }]` (`/analytics/growth`) | Grouped daily bars despite the name (kept for compatibility): shoppers ink, sellers grey `#8A857B`, legend top-left, whole-number axis (at least 0 to 1). No lines, so no spikes and no end labels crowding the right edge. |
| `unitsArea(daily, { key = "units", label?, color?, format? })` | `[{ date, units }]` | One line over a solid 8% area. No gradient. |

Helpers: `hasValues(data, keys?)`, `barListHeight(n)` (height for a bar list), `dailySummary`,
`statusSummary`, `rankSummary`, `statusRows`, `fieldLabel`, `formatterFor`, `TABLE_COLUMNS`.

Money keys (`revenue`, `amount`, `sales`, `price`) format as ₹ with Indian grouping (`₹38,42,600`) in
tooltips and labels, and as `₹45K` / `₹1.2L` / `₹3.4Cr` on axes. Counts use en-IN grouping. Dates from
the API (`"2026-11-09"`) read as calendar days: `9 Nov` on axes, `Mon, 9 Nov 2026` in tooltips.
User-entered names are HTML-escaped in tooltips.

## Example

```jsx
import { useMemo } from "react";
import { LazyChart, revenueOrdersCombo, hasValues, dailySummary, TABLE_COLUMNS } from "@/components/charts";

function RevenuePanel({ daily, loading, error, onRetry }) {
  const option = useMemo(() => revenueOrdersCombo(daily), [daily]);
  return (
    <LazyChart
      option={option}
      height={300}
      ariaLabel="Revenue and orders, last 30 days"
      summary={dailySummary(daily, { key: "revenue" })}
      table={{ columns: TABLE_COLUMNS.revenueOrders, rows: daily ?? [] }}
      loading={loading}
      error={error}
      onRetry={onRetry}
      empty={!hasValues(daily, ["revenue", "orders"])}
    />
  );
}
```

Order status is not a chart: use `StatusMeterList` (stamps + 1px meters + tabular counts):

```jsx
import { StatusMeterList } from "@/components/flipone";
<StatusMeterList title="Orders by status" counts={status?.orders} unit="orders" />
```

A top list:

```jsx
const top = useMemo(() => topList(sellers, "totalRevenue", { limit: 8 }), [sellers]);
<LazyChart option={top} height={barListHeight(Math.min(sellers.length, 8))} ariaLabel="Top sellers by revenue"
  summary={rankSummary(sellers, { valueKey: "totalRevenue" })} empty={!hasValues(sellers, ["totalRevenue"])} />
```

## Rules

- No gradients, glow, shadows on marks, 3D or many-slice pies. Thin axes, `#E6E3DC` gridlines, direct
  labels where they fit, Barlow Condensed tabular numerals.
- **Tag red (`#D3261C`, `COLORS.red`) is never a series, marker, dot or highlight colour.** It belongs to
  actions (primary buttons) and MRP prices only. `charts.test.js` checks every builder for it.
- Series colour order (`SERIES_COLORS`, the theme palette): ink, grey `#8A857B` (`COLORS.secondary`), kraft
  (`#A8875A` for marks on white; `#CDAE80` is too light), success, warning, muted.
- Status colours (`STATUS_COLORS`) follow the stamps: pending warning, shipped ink, delivered success,
  cancelled danger `#9E1B32` (never tag red).
- Prefer bars for sparse daily counts: a line between days with zero falls to the axis and reads as spikes.
- Say what a figure includes when it differs from the obvious reading (e.g. "incl. 1 cancelled").
- Every chart gets `ariaLabel` plus `summary` and/or `table`.
- Never add sample, placeholder or projected values: show `empty` instead.

## Tests

`charts.test.js` (formatters, builders, helpers) and `Chart.test.jsx` (states, a11y wiring, lazy load,
theme). Run `npm test`.
