// Seller order management, with status transition rules.
import Order from '../../models/Order.js';
import { HttpError, isValidId } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const sellerOrderLogger = logger.child({ label: 'controllers/sellerOrderController.js' });

const VALID_TRANSITIONS = {
  pending: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export const getSellerOrders = async (req, res) => {
  const sellerId = req.account._id;
  const orders = await Order.find({ 'items.seller': sellerId }).populate('user', 'name email').sort('-createdAt').lean();

  res.json({
    success: true,
    message: 'Orders fetched successfully',
    seller: req.account.name,
    orders: orders.map((order) => ({
      orderId: order._id,
      user: order.user?.name ?? 'Deleted user',
      status: order.status,
      shippingAddress: order.shippingAddress,
      items: order.items
        .filter((item) => item.seller?.equals(sellerId))
        .map((item) => ({
          itemId: item._id,
          productName: item.name,
          itemImage: item.image,
          quantity: item.quantity,
          price: item.price,
          status: item.status,
        })),
      totalAmount: order.totalAmount,
      date: order.createdAt,
    })),
  });
};

export const updateOrderStatus = async (req, res) => {
  const { orderId, itemId } = req.params;
  const { status } = req.body;
  if (!isValidId(orderId) || !isValidId(itemId)) throw new HttpError(400, 'Invalid order or item id');

  const order = await Order.findOne({
    _id: orderId,
    items: { $elemMatch: { _id: itemId, seller: req.account._id } },
  });
  if (!order) throw new HttpError(404, 'Order item not found for this seller');

  const item = order.items.id(itemId);
  if (!VALID_TRANSITIONS[item.status]?.includes(status)) {
    throw new HttpError(400, `Invalid status transition from ${item.status} to ${status}`);
  }

  item.status = status;
  // The order's overall status follows its items.
  const statuses = order.items.map((i) => i.status).filter((s) => s !== 'cancelled');
  if (statuses.length && statuses.every((s) => s === 'delivered')) order.status = 'delivered';
  else if (statuses.length && statuses.every((s) => s !== 'pending')) order.status = 'shipped';

  await order.save();
  sellerOrderLogger.info(`Item ${itemId} of order ${orderId} -> ${status} by seller ${req.account._id}`);

  res.json({ success: true, message: 'Order status updated successfully' });
};
