// Analytics (admin)
import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Seller from '../../models/Seller.js';
import Product from '../../models/Product.js';
import { parsePagination } from '../../utils/helpers.js';
import { parseDays, dayWindow, fillDays, itemSalesByDay, itemStatusCounts, TIMEZONE } from '../../services/analytics.js';

const NOT_CANCELLED = { status: { $ne: 'cancelled' } };
const DAY_MS = 24 * 60 * 60 * 1000;

// GET /analytics/order-status → counts of orders and of order items per status (for the status donut).
export const getOrderStatusBreakdown = async (req, res) => {
  const [orderRows, items] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    itemStatusCounts(),
  ]);
  const orders = { pending: 0, shipped: 0, delivered: 0, cancelled: 0 };
  for (const row of orderRows) orders[row._id] = row.count;
  res.json({ success: true, orders, items });
};

// GET /analytics/categories → revenue and units per category (cancelled items excluded).
export const getCategorySales = async (req, res) => {
  const categories = await Order.aggregate([
    { $unwind: '$items' },
    { $match: { 'items.status': { $ne: 'cancelled' } } },
    { $lookup: { from: 'products', localField: 'items.productId', foreignField: '_id', as: 'product' } },
    { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: { $ifNull: ['$product.category.name', 'Other'] },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        units: { $sum: '$items.quantity' },
      },
    },
    { $project: { _id: 0, category: '$_id', revenue: 1, units: 1 } },
    { $sort: { revenue: -1 } },
  ]);
  res.json({ success: true, categories });
};

// GET /analytics/growth?days=30 → new shoppers and sellers per day.
export const getSignupGrowth = async (req, res) => {
  const days = parseDays(req.query.days);
  const { keys, since } = dayWindow(days);
  const perDay = (Model) => Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TIMEZONE } }, count: { $sum: 1 } } },
  ]);
  const [users, sellers] = await Promise.all([perDay(User), perDay(Seller)]);
  const sellerByDay = new Map(sellers.map((row) => [row._id, row.count]));
  const daily = fillDays(keys, users.map((row) => ({ _id: row._id, users: row.count })), { users: 0 })
    .map((row) => ({ ...row, sellers: sellerByDay.get(row.date) ?? 0 }));
  res.json({ success: true, days, daily });
};

export const getAllOrdersWithSellerInfo = async (req, res) => {
  const { limit, skip } = parsePagination(req.query, { defaultLimit: 100, maxLimit: 500 });
  const orders = await Order.find()
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email')
    .populate('items.seller', 'name email')
    .lean();

  res.json({ success: true, orders });
};

export const getSellerSalesStats = async (req, res) => {
  const stats = await Order.aggregate([
    { $match: NOT_CANCELLED },
    { $unwind: '$items' },
    { $match: { 'items.status': { $ne: 'cancelled' } } },
    {
      $group: {
        _id: '$items.seller',
        totalQuantitySold: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        orderCount: { $sum: 1 },
      },
    },
    { $lookup: { from: 'sellers', localField: '_id', foreignField: '_id', as: 'seller' } },
    { $unwind: '$seller' },
    { $project: { sellerName: '$seller.name', totalQuantitySold: 1, totalRevenue: 1, orderCount: 1 } },
    { $sort: { totalRevenue: -1 } },
  ]);

  res.json({ success: true, stats });
};

// Daily sales plus the overall totals the dashboard cards show (cancelled orders excluded).
export const getSalesData = async (req, res) => {
  const salesData = await Order.aggregate([
    { $match: NOT_CANCELLED },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        totalSales: { $sum: '$totalAmount' },
        ordersCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalRevenue = salesData.reduce((sum, day) => sum + day.totalSales, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.ordersCount, 0);

  // Chart-ready: the last ?days= (default 30) with empty days filled with zeros.
  const days = parseDays(req.query.days);
  const daily = await itemSalesByDay({ days });

  res.json({ success: true, totalRevenue, totalOrders, salesData, days, daily });
};

export const getUserStatistics = async (req, res) => {
  const monthAgo = new Date(Date.now() - 30 * DAY_MS);
  const [[stats = {}], totalSellers] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          registeredLastMonth: { $sum: { $cond: [{ $gte: ['$createdAt', monthAgo] }, 1, 0] } },
        },
      },
    ]),
    Seller.countDocuments(),
  ]);

  res.json({
    success: true,
    totalUsers: stats.totalUsers ?? 0,
    activeUsers: stats.activeUsers ?? 0,
    registeredLastMonth: stats.registeredLastMonth ?? 0,
    totalSellers,
  });
};

export const getProductStatistics = async (req, res) => {
  const [stats = {}] = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        activeProducts: { $sum: { $cond: ['$isActive', 1, 0] } },
        totalStock: { $sum: '$stock' },
        averagePrice: { $avg: '$price' },
      },
    },
  ]);

  res.json({
    success: true,
    totalProducts: stats.totalProducts ?? 0,
    activeProducts: stats.activeProducts ?? 0,
    totalStock: stats.totalStock ?? 0,
    averagePrice: stats.averagePrice ?? 0,
  });
};
