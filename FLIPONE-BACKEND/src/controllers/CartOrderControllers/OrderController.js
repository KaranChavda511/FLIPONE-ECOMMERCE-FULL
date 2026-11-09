import Order, { SHIPPING_FEES } from '../../models/Order.js';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import { HttpError, isValidId } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const orderLogger = logger.child({ label: 'controllers/OrderController.js' });

/** Gives stock back for reserved [{ productId, quantity }]. */
const releaseStock = (reserved) =>
  reserved.length
    ? Product.bulkWrite(
        reserved.map(({ productId, quantity }) => ({
          updateOne: { filter: { _id: productId }, update: { $inc: { stock: quantity } } },
        })),
      )
    : null;

/**
 * Reserves stock with a conditional decrement per item ({ stock: { $gte: qty } }), so two buyers can't
 * both take the last unit. The old code read stock, then blindly $inc'd it, which could go negative.
 * If any item can't be reserved, everything reserved so far is given back.
 * (Works on a standalone MongoDB too, unlike a multi-document transaction.)
 */
const reserveStock = async (lines) => {
  const reserved = [];
  for (const line of lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, isActive: true, stock: { $gte: line.quantity } },
      { $inc: { stock: -line.quantity } },
      { returnDocument: 'after', projection: { _id: 1 } },
    );
    if (!updated) {
      await releaseStock(reserved);
      throw new HttpError(409, `${line.name} is out of stock`);
    }
    reserved.push(line);
  }
  return reserved;
};

export const createOrder = async (req, res) => {
  const userId = req.account._id;
  const cart = await Cart.findOne({ user: userId })
    .populate('items.product', 'name price stock isActive seller images')
    .lean();

  if (!cart?.items?.length) throw new HttpError(400, 'Your cart is empty');

  const lines = cart.items.map((item) => {
    const { product } = item;
    if (!product?.isActive) throw new HttpError(409, 'A product in your cart is no longer available');
    return {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      seller: product.seller,
      image: product.images ?? [],
    };
  });

  const reserved = await reserveStock(lines);

  const { shippingAddress, shippingMethod } = req.body;
  const shippingFee = SHIPPING_FEES[shippingMethod];
  const itemsTotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  let order;
  try {
    order = await Order.create({
      user: userId,
      items: lines,
      totalAmount: itemsTotal + shippingFee,
      shippingAddress,
      shippingMethod,
      shippingFee,
    });
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }

  await Cart.updateOne({ user: userId }, { $set: { items: [] } });
  orderLogger.info(`Order ${order._id} placed by user ${userId}`);

  res.status(201).json({
    success: true,
    order: {
      OrderId: order._id,
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      status: order.status,
      items: order.items.map(({ name, quantity, price, image }) => ({ name, quantity, price, image })),
    },
  });
};

export const getOrderHistory = async (req, res) => {
  const orders = await Order.find({ user: req.account._id, status: { $ne: 'cancelled' } })
    .sort('-createdAt')
    .lean();

  res.json({
    success: true,
    orders: orders.map((order) => ({
      orderId: order._id,
      products: order.items.map(({ name, quantity, price, image, status }) => ({ name, quantity, price, image, status })),
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee ?? 0,
      status: order.status,
      shippingAddress: order.shippingAddress,
      date: order.createdAt,
    })),
  });
};

export const cancelOrder = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid order id');

  // Cancellable only while nothing has shipped; flipping the status atomically stops a double restock.
  const order = await Order.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.account._id,
      status: 'pending',
      items: { $not: { $elemMatch: { status: { $ne: 'pending' } } } },
    },
    { $set: { status: 'cancelled', 'items.$[].status': 'cancelled' } },
    { returnDocument: 'after' },
  );
  if (!order) throw new HttpError(400, 'Order not found, or it can no longer be cancelled');

  await releaseStock(order.items.filter((item) => item.productId));
  orderLogger.info(`Order ${order._id} cancelled by user ${req.account._id}`);

  res.json({ success: true, message: 'Order cancelled' });
};
