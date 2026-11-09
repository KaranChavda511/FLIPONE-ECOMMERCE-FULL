/*
 * Ready-made ECharts options for FlipOne dashboards. Pure functions: API rows in, option object out.
 * No ECharts import (the theme in echarts.js supplies fonts, axis and tooltip styling), so pages can build
 * options without pulling ECharts into their own chunk.
 *
 * Every figure comes from the rows passed in. Nothing is padded, smoothed, projected or invented.
 *
 * API shapes (FLIPONE-BACKEND AnalyticsController):
 *  GET /analytics/sales          daily: [{ date: "2026-11-09", revenue, units, orders }]
 *  GET /analytics/growth         daily: [{ date, users, sellers }]
 *  GET /analytics/order-status   orders / items: { pending, shipped, delivered, cancelled }
 *  GET /analytics/categories     categories: [{ category, revenue, units }]
 *  GET /seller-stats             stats: [{ sellerName, totalRevenue, totalQuantitySold, orderCount }]
 */
import { capitalize } from "@/lib/format";
import { COLORS, FONT_NUM, FONT_SANS, STATUS_COLORS } from "./tokens";
import { compactInr, compactNumber, count, escapeHtml, inr, longDate, percent, shortDate } from "./formatters";

/* ---------- shared pieces ---------- */

const BASE = {
  animationDuration: 450,
  animationDurationUpdate: 300,
  animationEasing: "cubicOut",
};

/* Axis labels (and axis names) are kept inside the grid box: the ECharts 6 replacement for containLabel. */
const fitGrid = (box) => ({ outerBoundsMode: "same", outerBoundsContain: "all", ...box });

const num = (value) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const asRows = (rows) => (Array.isArray(rows) ? rows.filter((row) => row && typeof row === "object") : []);

/* Tooltip HTML. Inline styles because ECharts renders the tooltip outside Tailwind's reach. Names are
   escaped: category, seller and product names are user-entered. */
const NUM_CSS =
  "font-family:'Barlow Condensed','Work Sans',sans-serif;font-weight:600;font-size:15px;" +
  "font-variant-numeric:tabular-nums lining-nums;color:#17150F";

const tipHeader = (text) =>
  `<div style="font-weight:600;font-size:13px;color:#17150F;margin-bottom:4px">${escapeHtml(text)}</div>`;

const tipRow = (label, value, marker = "") =>
  `<div style="display:flex;align-items:baseline;justify-content:space-between;gap:20px;line-height:1.55">` +
  `<span style="color:#5C584F">${marker}${escapeHtml(label)}</span><span style="${NUM_CSS}">${escapeHtml(value)}</span></div>`;

const swatch = (color) =>
  `<span style="display:inline-block;width:8px;height:8px;margin-right:6px;background:${color};vertical-align:1px"></span>`;

const isMoneyKey = (key) => /revenue|amount|sales|price/i.test(String(key));

/** The formatter a value column gets by default: ₹ for money keys, en-IN counts otherwise. */
export const formatterFor = (key) => (isMoneyKey(key) ? inr : count);

const FIELD_LABELS = {
  revenue: "Revenue",
  totalRevenue: "Revenue",
  totalSales: "Revenue",
  units: "Units sold",
  totalQuantitySold: "Units sold",
  orders: "Orders",
  orderCount: "Orders",
  ordersCount: "Orders",
  users: "Shoppers",
  sellers: "Sellers",
  stock: "Stock",
};

/** Human label for an API field ("totalQuantitySold" -> "Units sold"). */
export const fieldLabel = (key) => FIELD_LABELS[key] ?? capitalize(String(key));

const LABEL_KEYS = ["name", "sellerName", "productName", "title", "category", "label"];
const pickLabelKey = (rows, preferred) =>
  preferred ?? LABEL_KEYS.find((key) => rows.some((row) => row[key] !== undefined)) ?? "name";

/* Daily rows from the API are already zero-filled per day; keep only the fields the chart draws. */
const dailySource = (daily, keys) =>
  asRows(daily).map((row) => {
    const out = { date: String(row.date ?? "") };
    for (const key of keys) out[key] = num(row[key]);
    return out;
  });

const dateAxis = (extra = {}) => ({
  type: "category",
  boundaryGap: true,
  axisLabel: { formatter: (value) => shortDate(value), hideOverlap: true },
  ...extra,
});

/** Axis tooltip for daily charts: long date header, one row per series with its own formatter. */
const dailyTooltip = (formats) => ({
  trigger: "axis",
  confine: true,
  formatter: (params) => {
    const list = Array.isArray(params) ? params : [params];
    if (!list.length) return "";
    const head = tipHeader(longDate(list[0].axisValue ?? list[0].name));
    const rows = list.map((p) => {
      // Series ids equal their dataset field ("revenue", "orders", ...): see the builders below.
      const key = p.seriesId in formats ? p.seriesId : p.dimensionNames?.[p.encode?.y?.[0]];
      const value = p.value && typeof p.value === "object" ? p.value[key] : p.value;
      const format = formats[key] ?? count;
      return tipRow(p.seriesName, format(value), swatch(p.color));
    });
    return head + rows.join("");
  },
});

/* ---------- empty checks + sizing ---------- */

/**
 * true when at least one row has a non-zero value in one of `keys`. Daily endpoints return zero-filled
 * days, so "no data" means every value is 0: show EmptyState instead of a flat chart.
 *   hasValues(daily, ["revenue", "orders"])
 *   hasValues(counts)  // a { pending, shipped, ... } object: any non-zero value
 */
export const hasValues = (data, keys) => {
  if (Array.isArray(data)) return data.some((row) => row && keys.some((key) => num(row[key]) !== 0));
  if (data && typeof data === "object") {
    const values = keys ? keys.map((key) => data[key]) : Object.values(data);
    return values.some((value) => num(value) !== 0);
  }
  return false;
};

/** Height (px) for a horizontal bar list of `n` rows: 34px per bar, 120px minimum. */
export const barListHeight = (n) => Math.max(120, Math.round(num(n)) * 34 + 16);

/* ---------- builders ---------- */

/**
 * Daily revenue as ink bars (₹). Orders and units per day are tooltip rows only; they are not drawn.
 * (The old orders line on a right axis read as a sawtooth falling to zero on every day without orders.)
 * daily: [{ date: "2026-11-09", revenue, orders, units? }] from GET /analytics/sales or /api/seller/analytics.
 * The units row appears only when the rows carry `units`. Name and signature unchanged; `ordersLabel`
 * now labels the tooltip row, `unitsLabel` (new, optional) the units row.
 */
export function revenueOrdersCombo(
  daily,
  { revenueLabel = "Revenue", ordersLabel = "Orders", unitsLabel = "Units sold" } = {}
) {
  const rows = asRows(daily);
  const withUnits = rows.some((row) => row.units !== undefined);
  const keys = withUnits ? ["revenue", "orders", "units"] : ["revenue", "orders"];
  const source = dailySource(rows, keys);
  return {
    ...BASE,
    dataset: { dimensions: ["date", ...keys], source },
    grid: fitGrid({ left: 0, right: 0, top: 12, bottom: 0 }),
    tooltip: {
      trigger: "axis",
      confine: true,
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        const row = p.value && typeof p.value === "object" ? p.value : source[p.dataIndex];
        if (!row) return "";
        return (
          tipHeader(longDate(p.axisValue ?? row.date)) +
          tipRow(revenueLabel, inr(row.revenue), swatch(COLORS.ink)) +
          tipRow(ordersLabel, count(row.orders)) +
          (withUnits ? tipRow(unitsLabel, count(row.units)) : "")
        );
      },
    },
    xAxis: dateAxis(),
    // A one-axis array, so `option.yAxis[0]` keeps working for code written against the two-axis version.
    yAxis: [{ type: "value", axisLabel: { formatter: (v) => compactInr(v) } }],
    series: [
      {
        id: "revenue",
        name: revenueLabel,
        type: "bar",
        encode: { x: "date", y: "revenue" },
        barMaxWidth: 18,
        barCategoryGap: "40%",
        itemStyle: { color: COLORS.ink, borderRadius: [1, 1, 0, 0] },
        emphasis: { itemStyle: { color: COLORS.inkSoft } },
      },
    ],
  };
}

const STATUS_ORDER = ["pending", "shipped", "delivered", "cancelled"];

/**
 * Order (or order item) status donut: pending warning, shipped ink, delivered success, cancelled danger,
 * with the total in the centre and counts as direct labels in the legend.
 * counts: { pending, shipped, delivered, cancelled } from GET /analytics/order-status (.orders or .items).
 * unit: the noun under the centre total ("orders" or "items").
 * legend: "right" (default: donut left, legend right, for wide short panels) or "bottom" (donut on top,
 * legend column centred under it, for narrow tall panels, about 360-420px wide and 320px+ high).
 */
export function statusDonut(counts, { unit = "orders", legend: legendPlacement = "right" } = {}) {
  const source = counts && typeof counts === "object" ? counts : {};
  const slices = STATUS_ORDER.map((status) => ({
    status,
    name: capitalize(status),
    value: num(source[status]),
    itemStyle: { color: STATUS_COLORS[status] },
  }));
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const byName = Object.fromEntries(slices.map((slice) => [slice.name, slice.value]));
  const below = legendPlacement === "bottom";
  const center = below ? ["50%", "36%"] : ["30%", "50%"];

  return {
    ...BASE,
    tooltip: {
      trigger: "item",
      confine: true,
      formatter: (p) =>
        tipHeader(p.name) + tipRow(unit === "items" ? "Items" : "Orders", count(p.value)) + tipRow("Share", percent(total ? p.value / total : NaN)),
    },
    legend: {
      orient: "vertical",
      ...(below ? { left: "center", bottom: 0, itemGap: 8 } : { right: 0, top: "middle", itemGap: 14 }),
      data: slices.map((slice) => slice.name),
      formatter: (name) => `{n|${name}}{v|${count(byName[name])}}{p|${percent(total ? byName[name] / total : NaN)}}`,
      textStyle: {
        rich: {
          n: { fontFamily: FONT_SANS, fontSize: 13, color: COLORS.inkSoft, width: 78 },
          v: { fontFamily: FONT_NUM, fontSize: 15, fontWeight: 600, color: COLORS.ink, width: 44, align: "right" },
          p: { fontFamily: FONT_NUM, fontSize: 13, fontWeight: 500, color: COLORS.muted, width: 40, align: "right" },
        },
      },
    },
    series: [
      {
        id: "status",
        name: "Status",
        type: "pie",
        center,
        radius: below ? ["44%", "62%"] : ["58%", "82%"],
        startAngle: 90,
        clockwise: true,
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 3, label: { show: false } },
        data: slices.map(({ name, value, itemStyle }) => ({ name, value, itemStyle })),
      },
      {
        /* Centre total: one silent transparent disc carrying the label (no extra component needed). */
        id: "total",
        name: "Total",
        type: "pie",
        center,
        radius: [0, below ? "40%" : "50%"],
        silent: true,
        legendHoverLink: false,
        tooltip: { show: false },
        emphasis: { disabled: true },
        itemStyle: { color: "transparent", borderWidth: 0 },
        label: {
          show: true,
          position: "center",
          formatter: `{v|${count(total)}}\n{u|${unit}}`,
          rich: {
            v: { fontFamily: FONT_NUM, fontSize: 30, fontWeight: 600, color: COLORS.ink, lineHeight: 32 },
            u: { fontFamily: FONT_SANS, fontSize: 12, color: COLORS.muted, lineHeight: 16 },
          },
        },
        labelLine: { show: false },
        data: [{ name: "Total", value: 1 }],
      },
    ],
  };
}

/** Shared horizontal bar list (sorted, largest on top, values as direct labels, no value axis). */
function horizontalBars(rows, { labelKey, valueKey, format, limit, color, seriesName, tooltipKeys }) {
  const list = asRows(rows);
  const key = pickLabelKey(list, labelKey);
  const fmt = format ?? formatterFor(valueKey);
  const items = list
    .map((row) => ({ label: String(row[key] ?? "").trim() || "Other", value: num(row[valueKey]), row }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit ?? undefined);
  const extraKeys = (tooltipKeys ?? []).filter((k) => k !== valueKey && items.some((item) => item.row[k] !== undefined));

  return {
    ...BASE,
    grid: fitGrid({ left: 0, right: 96, top: 0, bottom: 0 }),
    tooltip: {
      trigger: "axis",
      confine: true,
      axisPointer: { type: "shadow" },
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const item = p && items[p.dataIndex];
        if (!item) return "";
        return (
          tipHeader(item.label) +
          tipRow(seriesName, fmt(item.value)) +
          extraKeys.map((k) => tipRow(fieldLabel(k), formatterFor(k)(item.row[k]))).join("")
        );
      },
    },
    xAxis: { type: "value", show: false, splitLine: { show: false } },
    yAxis: {
      type: "category",
      inverse: true,
      data: items.map((item) => item.label),
      axisLine: { show: true, lineStyle: { color: COLORS.axis } },
      // 190px fits most product/seller names; longer ones still truncate (full name in the tooltip).
      axisLabel: { fontFamily: FONT_SANS, fontSize: 13, color: COLORS.inkSoft, width: 190, overflow: "truncate" },
    },
    series: [
      {
        id: valueKey,
        name: seriesName,
        type: "bar",
        data: items.map((item) => item.value),
        barMaxWidth: 18,
        barCategoryGap: "38%",
        itemStyle: { color, borderRadius: [0, 1, 1, 0] },
        emphasis: { itemStyle: { color: COLORS.inkSoft } },
        label: {
          show: true,
          position: "right",
          distance: 8,
          formatter: (p) => fmt(p.value),
          fontFamily: FONT_NUM,
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.ink,
        },
      },
    ],
  };
}

/**
 * Category sales as horizontal bars, sorted largest first.
 * rows: [{ category, revenue, units }] from GET /analytics/categories. valueKey "revenue" (₹) or "units".
 */
export function categoryBars(rows, { valueKey = "revenue", labelKey = "category", limit, format } = {}) {
  return horizontalBars(rows, {
    labelKey,
    valueKey,
    format,
    limit,
    color: COLORS.ink,
    seriesName: fieldLabel(valueKey),
    tooltipKeys: ["revenue", "units"],
  });
}

/**
 * Top N (default 10) sellers or products as horizontal bars.
 * rows: e.g. seller stats [{ sellerName, totalRevenue, totalQuantitySold, orderCount }].
 * valueKey: the field to rank by ("totalRevenue", "totalQuantitySold", ...). The label field is found
 * automatically (name, sellerName, productName, title, category, label) or passed as `labelKey`.
 */
export function topList(rows, valueKey = "totalRevenue", { labelKey, limit = 10, format } = {}) {
  return horizontalBars(rows, {
    labelKey,
    valueKey,
    format,
    limit,
    color: COLORS.ink,
    seriesName: fieldLabel(valueKey),
    tooltipKeys: ["totalRevenue", "revenue", "totalQuantitySold", "units", "orderCount", "orders"],
  });
}

/**
 * New shoppers and sellers per day as grouped daily bars (shoppers ink, sellers grey #8A857B), legend
 * top-left, whole-number axis. Bars, not lines: lines between sparse sign-up days drew spikes, and the
 * old end-of-line labels collided at the right edge. (Name kept for compatibility.)
 * daily: [{ date, users, sellers }] from GET /analytics/growth.
 */
export function signupLines(daily, { usersLabel = "Shoppers", sellersLabel = "Sellers" } = {}) {
  const source = dailySource(daily, ["users", "sellers"]);
  const bars = (id, name, color) => ({
    id,
    name,
    type: "bar",
    encode: { x: "date", y: id },
    barMaxWidth: 10,
    barGap: "20%",
    barCategoryGap: "35%",
    itemStyle: { color, borderRadius: [1, 1, 0, 0] },
    emphasis: { focus: "none" },
  });
  return {
    ...BASE,
    dataset: { dimensions: ["date", "users", "sellers"], source },
    legend: { top: 0, left: 0, data: [usersLabel, sellersLabel] },
    grid: fitGrid({ left: 0, right: 0, top: 36, bottom: 0 }),
    tooltip: { ...dailyTooltip({ users: count, sellers: count }), axisPointer: { type: "shadow" } },
    xAxis: dateAxis(),
    yAxis: {
      type: "value",
      minInterval: 1,
      // At least 0 to 1, so a week with no sign-ups never prints fractional ticks.
      max: (extent) => Math.max(1, Math.ceil(extent.max)),
      axisLabel: { formatter: (v) => compactNumber(v) },
    },
    series: [bars("users", usersLabel, COLORS.ink), bars("sellers", sellersLabel, COLORS.secondary)],
  };
}

/**
 * One daily measure as a plain line over a light solid area (8% opacity, no gradient).
 * daily: [{ date, units }] by default; pass `key` for another field (e.g. "orders").
 */
export function unitsArea(daily, { key = "units", label, color = COLORS.ink, format } = {}) {
  const source = dailySource(daily, [key]);
  const fmt = format ?? formatterFor(key);
  return {
    ...BASE,
    dataset: { dimensions: ["date", key], source },
    grid: fitGrid({ left: 0, right: 8, top: 12, bottom: 0 }),
    tooltip: dailyTooltip({ [key]: fmt }),
    xAxis: dateAxis({ boundaryGap: false }),
    yAxis: {
      type: "value",
      minInterval: isMoneyKey(key) ? undefined : 1,
      axisLabel: { formatter: (v) => (isMoneyKey(key) ? compactInr(v) : compactNumber(v)) },
    },
    series: [
      {
        id: key,
        name: label ?? fieldLabel(key),
        type: "line",
        encode: { x: "date", y: key },
        showSymbol: false,
        symbolSize: 6,
        lineStyle: { color, width: 2 },
        itemStyle: { color },
        areaStyle: { color, opacity: 0.08 },
        emphasis: { focus: "none", scale: false },
      },
    ],
  };
}

/* ---------- text alternatives (aria-label summaries + hidden tables) ---------- */

/**
 * One-sentence summary of a daily series for screen readers, built from the same rows as the chart.
 * dailySummary(daily, { key: "revenue", label: "Revenue" })
 *   -> "Revenue over 30 days: total ₹1,24,500. Highest on Mon, 9 Nov 2026 at ₹18,200."
 */
export function dailySummary(daily, { key, label = fieldLabel(key), format = formatterFor(key) }) {
  const rows = asRows(daily);
  if (!rows.length) return `${label}: no data.`;
  const total = rows.reduce((sum, row) => sum + num(row[key]), 0);
  const best = rows.reduce((top, row) => (num(row[key]) > num(top[key]) ? row : top), rows[0]);
  const days = `${rows.length} ${rows.length === 1 ? "day" : "days"}`;
  if (total === 0) return `${label} over ${days}: none.`;
  return `${label} over ${days}: total ${format(total)}. Highest on ${longDate(best.date)} at ${format(best[key])}.`;
}

/** statusSummary({ pending: 3, shipped: 5 }, "orders") -> "8 orders: 3 pending, 5 shipped, 0 delivered, 0 cancelled." */
export function statusSummary(counts, unit = "orders") {
  const source = counts && typeof counts === "object" ? counts : {};
  const total = STATUS_ORDER.reduce((sum, status) => sum + num(source[status]), 0);
  const parts = STATUS_ORDER.map((status) => `${count(num(source[status]))} ${status}`);
  return `${count(total)} ${unit}: ${parts.join(", ")}.`;
}

/** rankSummary(rows, { valueKey: "revenue" }) -> "Top: Women ₹82,000, Men ₹41,500, Bags ₹9,900 (6 in all)." */
export function rankSummary(rows, { valueKey, labelKey, format = formatterFor(valueKey), top = 3 }) {
  const list = asRows(rows);
  if (!list.length) return "No data.";
  const key = pickLabelKey(list, labelKey);
  const sorted = [...list].sort((a, b) => num(b[valueKey]) - num(a[valueKey]));
  const head = sorted.slice(0, top).map((row) => `${row[key] ?? "Other"} ${format(num(row[valueKey]))}`);
  return `Top: ${head.join(", ")} (${list.length} in all).`;
}

/**
 * Column sets for <Chart table={...}>, the visually hidden data table that mirrors each chart.
 * Each column: { key, label, format }.
 */
export const TABLE_COLUMNS = {
  revenueOrders: [
    { key: "date", label: "Day", format: longDate },
    { key: "revenue", label: "Revenue", format: inr },
    { key: "orders", label: "Orders", format: count },
  ],
  signups: [
    { key: "date", label: "Day", format: longDate },
    { key: "users", label: "New shoppers", format: count },
    { key: "sellers", label: "New sellers", format: count },
  ],
  units: [
    { key: "date", label: "Day", format: longDate },
    { key: "units", label: "Units sold", format: count },
  ],
  categories: [
    { key: "category", label: "Category", format: (v) => String(v ?? "Other") },
    { key: "revenue", label: "Revenue", format: inr },
    { key: "units", label: "Units sold", format: count },
  ],
};

/** Rows for the status donut's hidden table: [{ status: "Pending", count: 3 }, ...]. */
export const statusRows = (counts) =>
  STATUS_ORDER.map((status) => ({ status: capitalize(status), count: num(counts?.[status]) }));
