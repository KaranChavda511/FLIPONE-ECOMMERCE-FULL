import mongoose from 'mongoose';
import Category from './Category.js';

export const MAX_PRODUCT_IMAGES = 5;

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: {
      type: [String],
      validate: {
        validator: (v) => v.length <= MAX_PRODUCT_IMAGES,
        message: `Exceeds maximum of ${MAX_PRODUCT_IMAGES} images`,
      },
    },
    // Denormalised copy of the category, so listings need no join.
    category: {
      _id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
    },
    subcategories: {
      type: [String],
      validate: {
        validator: async function (subs) {
          if (!subs?.length) return true;
          // `this` is the document on save; on update validators it is the Query (context: 'query') or undefined.
          // The update path also re-checks this in the controller.
          const categoryId = this?.category?._id ?? this?.get?.('category._id');
          if (!categoryId) return true;
          const category = await Category.findById(categoryId).lean();
          const allowed = new Set((category?.subcategories ?? []).map((s) => s.toLowerCase()));
          return subs.every((sub) => allowed.has(sub.toLowerCase()));
        },
        message: 'Invalid subcategory for the selected category.',
      },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

productSchema.index({ seller: 1, name: 1, 'category._id': 1 }, { unique: true });
// Storefront listing: active products, newest first, optionally by category.
productSchema.index({ isActive: 1, 'category.name': 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
