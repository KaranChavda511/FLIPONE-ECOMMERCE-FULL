// Seller analytics: only the logged-in seller's own order items and products.
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import { parseDays, itemSalesByDay, itemStatusCounts } from '../../services/analytics.js';

// Same threshold as the storefront tags ("ONLY N LEFT") and the seller/admin product lists.
const LOW_STOCK = 5;

// GET /api/seller/analytics?days=30
export const getSellerAnalytics = async (req, res) => {
  const sellerId = req.account._id;
  const days = parseDays(req.query.days);
  const mine = { 'items.seller': sellerId };

  const [daily, statusCounts, topProducts, totalsRow, inventory] = await Promise.all([
    itemSalesByDay({ days, match: mine, itemMatch: mine }),
    itemStatusCounts(mine),
    Order.aggregate([
      { $match: mine },
      { $unwind: '$items' },
      { $match: { ...mine, 'items.status': { $ne: 'cancelled' } } },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          units: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, productId: '$_id', name: 1, units: 1, revenue: 1 } },
    ]),
    Order.aggregate([
      { $match: mine },
      { $unwind: '$items' },
      { $match: { ...mine, 'items.status': { $ne: 'cancelled' } } },
      {
        $group: {
          _id: null,
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          units: { $sum: '$items.quantity' },
          orderIds: { $addToSet: '$_id' },
        },
      },
      { $project: { _id: 0, revenue: 1, units: 1, orders: { $size: '$orderIds' } } },
    ]),
    Product.aggregate([
      { $match: { seller: sellerId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $and: ['$isActive', { $eq: ['$stock', 0] }] }, 1, 0] } },
          lowStock: { $sum: { $cond: [{ $and: ['$isActive', { $gt: ['$stock', 0] }, { $lte: ['$stock', LOW_STOCK] }] }, 1, 0] } },
        },
      },
      { $project: { _id: 0 } },
    ]),
  ]);

  res.json({
    success: true,
    days,
    totals: totalsRow[0] ?? { revenue: 0, units: 0, orders: 0 },
    statusCounts,
    products: inventory[0] ?? { total: 0, active: 0, outOfStock: 0, lowStock: 0 },
    lowStockThreshold: LOW_STOCK,
    daily,
    topProducts,
  });
};
