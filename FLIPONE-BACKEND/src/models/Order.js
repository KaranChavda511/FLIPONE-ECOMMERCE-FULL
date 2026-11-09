import mongoose from 'mongoose';

export const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];
// Rupees. The cart page shows the same values (keep FLIPONE-FRONTEND Addtocart.jsx SHIPPING_COST in sync).
export const SHIPPING_FEES = { flat: 30, pickup: 0 };

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', index: true },
  name: String,
  price: Number,
  quantity: Number,
  image: [String],
  status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

// Was missing from the schema, so the checkout address was silently dropped.
const shippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    items: [orderItemSchema],
    // Items total + shippingFee.
    totalAmount: { type: Number, required: true },
    shippingAddress: shippingAddressSchema,
    shippingMethod: { type: String, enum: Object.keys(SHIPPING_FEES), default: 'flat' },
    shippingFee: { type: Number, default: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    paymentMethod: { type: String, default: 'COD' },
  },
  { timestamps: true },
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
