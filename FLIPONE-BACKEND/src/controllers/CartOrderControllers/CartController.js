// Cart (logged-in users), with stock checks.
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';
import { HttpError, isValidId } from '../../utils/helpers.js';

const stockStatus = (stock) => (stock > 5 ? 'in-stock' : stock > 0 ? 'low-stock' : 'out-of-stock');

export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.account._id })
    .populate('items.product', 'name price images stock isActive category')
    .lean();

  // Products that were deleted since being added come back as null; skip them instead of crashing.
  const items = (cart?.items ?? [])
    .filter((item) => item.product)
    .map((item) => {
      const { product } = item;
      const available = product.isActive ? Math.min(item.quantity, product.stock) : 0;
      return {
        ItemId: item._id,
        product: {
          ProductId: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          category: product.category?.name,
          // How many the shopper may put in the cart (0 when the product was deactivated).
          stock: product.isActive ? product.stock : 0,
          stockStatus: stockStatus(product.stock),
        },
        requestedQuantity: item.quantity,
        availableQuantity: available,
        lineTotal: product.price * available,
        warnings: available < item.quantity ? [`Only ${available} items available (requested ${item.quantity})`] : [],
      };
    });

  const warnings = items.flatMap((item) => item.warnings);

  res.json({
    success: true,
    data: {
      items,
      meta: {
        totalItems: items.reduce((sum, item) => sum + item.availableQuantity, 0),
        totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
        currency: 'INR',
        warnings,
        hasIssues: warnings.length > 0,
      },
    },
  });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  // Queried a non-existent `ProductID` field, which strictQuery drops, so this matched *any* active product.
  const product = await Product.findOne({ _id: productId, isActive: true }).lean();
  if (!product) throw new HttpError(404, 'Product not found or inactive');

  const cart = (await Cart.findOne({ user: req.account._id })) ?? new Cart({ user: req.account._id });
  const existingItem = cart.items.find((item) => item.product.equals(productId));
  const alreadyInCart = existingItem?.quantity ?? 0;

  if (alreadyInCart + quantity > product.stock) {
    const available = Math.max(product.stock - alreadyInCart, 0);
    return res.status(409).json({
      success: false,
      error: 'INSUFFICIENT_STOCK',
      message: 'Cannot add requested quantity',
      details: { available, maximumAllowed: available },
    });
  }

  if (existingItem) existingItem.quantity += quantity;
  else cart.items.push({ product: productId, quantity });
  await cart.save();

  const item = existingItem ?? cart.items.at(-1);
  res.json({
    success: true,
    data: { cartItemId: item._id, productId, images: product.images, quantity: item.quantity },
  });
};

export const updateCart = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  if (!isValidId(itemId)) throw new HttpError(400, 'Invalid cart item id');

  const cart = await Cart.findOne({ user: req.account._id });
  const item = cart?.items.id(itemId);
  if (!item) throw new HttpError(404, 'Cart item not found');

  const product = await Product.findById(item.product).select('stock isActive').lean();
  if (!product?.isActive || quantity > product.stock) throw new HttpError(400, 'Requested quantity not available');

  item.quantity = quantity;
  await cart.save();
  res.json({ success: true, message: 'Cart updated' });
};

export const removeFromCart = async (req, res) => {
  const { itemId } = req.params;
  if (!isValidId(itemId)) throw new HttpError(400, 'Invalid cart item id');

  await Cart.updateOne({ user: req.account._id }, { $pull: { items: { _id: itemId } } });
  res.json({ success: true, message: 'Item removed from cart' });
};

export const clearCart = async (req, res) => {
  await Cart.updateOne({ user: req.account._id }, { $set: { items: [] } });
  res.json({ success: true, message: 'Cart cleared' });
};
