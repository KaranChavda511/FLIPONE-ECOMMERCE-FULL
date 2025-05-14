// Seller Order Management (for logged in sellers)
// getSellerOrders, updateOrderStatus with status transition validation

import Order from '../../models/Order.js';
import logger from '../../services/logger.js';

const sellerOrderControllerLogger = logger.child({ label: '/SellerOrderController/SellerOrderController.js' });

const validStatusTransitions = {
  pending: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// ----------------------------- GET ORDERS -----------------------------
export const getSellerOrders = async (req, res) => {
  try {
    sellerOrderControllerLogger.info(`Fetching orders for seller: ${req.account.id}`);

    const orders = await Order.find({
      'items.seller': req.account.id
    })
      .populate('user', 'name email')
      .sort('-createdAt');

    sellerOrderControllerLogger.info(`Fetched ${orders.length} orders for seller: ${req.account.id}`);

    

    res.json({
      success: true,
      message: 'Orders fetched successfully',
      seller: req.account.name,
      orders: orders.map(order => ({
        orderId: order._id,
        user: order.user.name,
        items: order.items
          .filter(item => item.seller.toString() === req.account.id) // Filter items for current seller
          .map(item => ({
            itemId: item._id,
            productName: item.name,
            itemImage: item.image,
            quantity: item.quantity,
            price: item.price,
            status: item.status
          })),
        totalAmount: order.totalAmount,
        date: order.createdAt
      }))
    });

  } catch (error) {
    sellerOrderControllerLogger.error(`Get Orders Error: ${error.message}`, {
      stack: error.stack,
      sellerId: req.account.id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};



// ------------------------ UPDATE ORDER STATUS -------------------------
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { status } = req.body;
    const sellerId = req.account.id;

    sellerOrderControllerLogger.info(`Updating order status`, {
      sellerId,
      orderId,
      itemId,
      newStatus: status
    });

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      'items._id': itemId,
      'items.seller': sellerId
    });

    if (!order) {
      sellerOrderControllerLogger.warn(`Order item not found`, {
        orderId,
        itemId,
        sellerId
      });
      return res.status(404).json({
        success: false,
        message: 'Order item not found for this seller'
      });
    }

    const item = order.items.id(itemId);

    

    const allowedTransitions = validStatusTransitions[item.status];
    if (!allowedTransitions.includes(status)) {
      sellerOrderControllerLogger.warn(`Invalid status transition`, {
        sellerId,
        currentStatus: item.status,
        attemptedStatus: status
      });

      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${item.status} to ${status}`
      });
    }

    item.status = status;
    await order.save();

    sellerOrderControllerLogger.info(`Order item status updated`, {
      sellerId,
      orderId,
      itemId,
      newStatus: status
    });

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    sellerOrderControllerLogger.error(`Update Status Error: ${error.message}`, {
      stack: error.stack,
      sellerId: req.account.id,
      orderId: req.params.orderId,
      itemId: req.params.itemId
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};
