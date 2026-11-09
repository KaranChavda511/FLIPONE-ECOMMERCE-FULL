// Shared helpers for chart-ready analytics. Days are bucketed in India time so "today" matches the users'.
import Order from '../models/Order.js';

export const TIMEZONE = 'Asia/Kolkata';
const DAY_MS = 24 * 60 * 60 * 1000;

/** ?days= → 7..365, default 30. */
export const parseDays = (value, fallback = 30) => Math.min(365, Math.max(7, Number.parseInt(value, 10) || fallback));

const dayKey = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(date); // YYYY-MM-DD

/** The last `days` calendar days (oldest first) and the instant the window starts. */
export const dayWindow = (days) => {
  const keys = [];
  for (let i = days - 1; i >= 0; i--) keys.push(dayKey(new Date(Date.now() - i * DAY_MS)));
  // Start a day early and let the key filter trim, so timezone offsets never drop the first day.
  return { keys, since: new Date(Date.now() - (days + 1) * DAY_MS) };
};

/** Fills missing days with zeroed rows so charts have no gaps. */
export const fillDays = (keys, rows, zero) => {
  const byDay = new Map(rows.map((row) => [row._id, row]));
  return keys.map((date) => {
    const { _id, ...values } = byDay.get(date) ?? {};
    return { date, ...zero, ...values };
  });
};

const dayExpr = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE } };

/**
 * Item-level sales per day. `match` filters orders (e.g. by seller via items.seller); `itemMatch` filters
 * unwound items. Cancelled items never count as revenue.
 */
export const itemSalesByDay = async ({ days, match = {}, itemMatch = {} }) => {
  const { keys, since } = dayWindow(days);
  const rows = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, ...match } },
    { $unwind: '$items' },
    { $match: { 'items.status': { $ne: 'cancelled' }, ...itemMatch } },
    {
      $group: {
        _id: dayExpr,
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        units: { $sum: '$items.quantity' },
        orderIds: { $addToSet: '$_id' },
      },
    },
    { $project: { revenue: 1, units: 1, orders: { $size: '$orderIds' } } },
  ]);
  return fillDays(keys, rows, { revenue: 0, units: 0, orders: 0 });
};

/** Counts of order items per status, optionally for one seller. */
export const itemStatusCounts = async (itemMatch = {}) => {
  const rows = await Order.aggregate([
    { $unwind: '$items' },
    { $match: itemMatch },
    { $group: { _id: '$items.status', count: { $sum: 1 } } },
  ]);
  const counts = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const row of rows) counts[row._id] = row.count;
  return counts;
};
