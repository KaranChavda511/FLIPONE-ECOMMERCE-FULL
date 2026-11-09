// Public product browsing.
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import Seller from '../../models/Seller.js';
import { HttpError, isValidId, parsePagination, searchRegex } from '../../utils/helpers.js';

/** Products from deactivated sellers are hidden: filter by active seller ids in the query, not after fetching. */
const activeSellerIds = () => Seller.find({ isActive: true }).distinct('_id');

const toNumber = (value) => {
  const number = Number(value);
  return value !== undefined && value !== '' && Number.isFinite(number) ? number : undefined;
};

// GET /api/product?category=&minPrice=&maxPrice=&page=&limit=  (also /api/admin/product-list)
export const getAllActiveProducts = async (req, res) => {
  const { category } = req.query;
  const minPrice = toNumber(req.query.minPrice);
  const maxPrice = toNumber(req.query.maxPrice);
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50, maxLimit: 200 });

  const query = { isActive: true, seller: { $in: await activeSellerIds() } };
  // Was { category }, which can't match the embedded {_id, name}, so the filter never worked.
  // Exact name, any case: ?category=eyewear and ?category=Eyewear both match "Eyewear".
  if (typeof category === 'string' && category.trim()) {
    query['category.name'] = new RegExp(`^${RegExp.escape(category.trim())}$`, 'i');
  }
  // Min and max used to overwrite each other.
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort('-createdAt').skip(skip).limit(limit).populate('seller', 'name licenseID').lean(),
    Product.countDocuments(query),
  ]);

  res.json({ success: true, total, page, totalPages: Math.ceil(total / limit), products });
};

export const searchProducts = async (req, res) => {
  const { q } = req.query;
  if (typeof q !== 'string' || !q.trim()) throw new HttpError(400, 'Search query required');

  const pattern = searchRegex(q);
  const products = await Product.find({
    isActive: true,
    seller: { $in: await activeSellerIds() },
    $or: [{ name: pattern }, { description: pattern }, { 'category.name': pattern }, { subcategories: pattern }],
  })
    .limit(100)
    .populate('seller', 'name')
    .lean();

  res.json({ success: true, results: products.length, products });
};

export const getProductDetails = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) throw new HttpError(400, 'Invalid product id');

  // isActive wasn't selected on the seller before, so every product came back 404.
  const product = await Product.findById(id).populate('seller', 'name licenseID isActive').lean();
  if (!product?.isActive || !product.seller?.isActive) throw new HttpError(404, 'Product not found');

  const { isActive: _sellerActive, ...seller } = product.seller;
  res.json({ success: true, product: { ...product, seller } });
};

// Kept as a bare array (the frontend expects that shape).
export const getAllCategories = async (req, res) => {
  const categories = await Category.find().select('name subcategories').sort('name').lean();
  res.json(categories);
};
