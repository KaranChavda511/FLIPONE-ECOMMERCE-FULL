/*
 * Indian formatting helpers (en-IN grouping: 1,23,456). Plain functions, no React.
 */

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") return NaN;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : NaN;
};

const inrWhole = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrPaise = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const plain = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/**
 * formatInr(1299) -> "₹1,299"; formatInr(3842600) -> "₹38,42,600"; formatInr(99.5) -> "₹99.50".
 * Whole rupees print without paise; fractional amounts print two decimals.
 * Invalid input returns the `fallback` ("—" by default).
 */
export const formatInr = (value, { fallback = "—" } = {}) => {
  const n = toNumber(value);
  if (Number.isNaN(n)) return fallback;
  return (Number.isInteger(n) ? inrWhole : inrPaise).format(n);
};

/** formatNumber(1284) -> "1,284" (en-IN grouping). */
export const formatNumber = (value, { fallback = "—" } = {}) => {
  const n = toNumber(value);
  return Number.isNaN(n) ? fallback : plain.format(n);
};

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** formatDate("2026-11-09T10:00:00Z") -> "9 Nov 2026". Invalid input returns the fallback. */
export const formatDate = (value, { fallback = "—" } = {}) => {
  if (!value) return fallback;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : dateFmt.format(d);
};

/** shortId("665f0c2a9b1e4d6f3a21") -> "#6F3A21": the last 6 characters of a Mongo id, for order numbers. */
export const shortId = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : "");

/** Capitalise the first letter ("women" -> "Women") without touching the rest. */
export const capitalize = (text) => (text ? String(text).charAt(0).toUpperCase() + String(text).slice(1) : "");
