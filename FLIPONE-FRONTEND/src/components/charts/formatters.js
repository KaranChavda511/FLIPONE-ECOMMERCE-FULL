/*
 * Chart number and date formatting (en-IN). Plain functions: used in axis labels, tooltips, direct labels
 * and the visually hidden summaries, so the chart and its text alternative always print the same figures.
 */
import { formatInr, formatNumber } from "@/lib/format";

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
};

/** inr(3842600) -> "₹38,42,600"; inr(99.5) -> "₹99.50"; invalid -> "—". */
export const inr = (value) => formatInr(value);

/** count(1284) -> "1,284"; invalid -> "—". */
export const count = (value) => formatNumber(value);

/* Indian units, largest first. */
const UNITS = [
  { size: 1e7, suffix: "Cr" },
  { size: 1e5, suffix: "L" },
  { size: 1e3, suffix: "K" },
];

const oneDecimal = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const whole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const round1 = (n) => Math.round(n * 10) / 10;

/**
 * compactNumber(45000) -> "45K"; compactNumber(120000) -> "1.2L"; compactNumber(34000000) -> "3.4Cr".
 * One decimal at most, trailing ".0" dropped. A value that rounds up into the next unit is promoted
 * (99,950 -> "1L", not "100K"). Below 1,000 prints whole numbers.
 */
export const compactNumber = (value, { fallback = "—" } = {}) => {
  const n = toNumber(value);
  if (Number.isNaN(n)) return fallback;
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  let index = UNITS.findIndex((unit) => abs >= unit.size);
  if (index === -1) {
    const rounded = Math.round(abs);
    if (rounded < UNITS[2].size) return `${sign}${whole.format(rounded)}`;
    index = 2; // 999.6 rounds to 1,000 -> "1K"
  }
  let scaled = round1(abs / UNITS[index].size);
  // Promote when rounding reaches the next unit: 99,950 -> 100K -> 1L.
  if (index > 0 && scaled * UNITS[index].size >= UNITS[index - 1].size) {
    index -= 1;
    scaled = round1(abs / UNITS[index].size);
  }
  return `${sign}${oneDecimal.format(scaled)}${UNITS[index].suffix}`;
};

/** compactInr(45000) -> "₹45K"; compactInr(120000) -> "₹1.2L"; compactInr(0) -> "₹0". For axes. */
export const compactInr = (value, { fallback = "—" } = {}) => {
  const text = compactNumber(value, { fallback: null });
  if (text === null) return fallback;
  return text.startsWith("-") ? `-₹${text.slice(1)}` : `₹${text}`;
};

/* "YYYY-MM-DD" is a calendar day (the API buckets in India time). Read it as UTC so no viewer timezone
   can shift it by a day. Full ISO timestamps fall back to Date parsing. */
const parseDay = (value) => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" || !value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = match ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3])) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const shortFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
// Built from parts: en-IN's own weekday+year pattern prints "Mon, 9 Nov, 2026" (stray comma).
const weekdayFmt = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" });

/** shortDate("2026-11-09") -> "9 Nov". Invalid -> the input unchanged (or "" for empty). */
export const shortDate = (value) => {
  const date = parseDay(value);
  return date ? shortFmt.format(date) : String(value ?? "");
};

/** longDate("2026-11-09") -> "Mon, 9 Nov 2026" (tooltip headers and summaries). */
export const longDate = (value) => {
  const date = parseDay(value);
  return date
    ? `${weekdayFmt.format(date)}, ${shortFmt.format(date)} ${date.getUTCFullYear()}`
    : String(value ?? "");
};

/** percent(0.314) -> "31%". */
export const percent = (ratio) => (Number.isFinite(ratio) ? `${Math.round(ratio * 100)}%` : "—");

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escape text for ECharts HTML tooltips (category, seller and product names come from users). */
export const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
