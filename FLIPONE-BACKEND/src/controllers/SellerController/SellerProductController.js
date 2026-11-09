import Product, { MAX_PRODUCT_IMAGES } from '../../models/Product.js';
import Category from '../../models/Category.js';
import { HttpError, isValidId } from '../../utils/helpers.js';
import { toPublicPath } from '../../utils/FileUploads.js';
import logger from '../../services/logger.js';

const productLogger = logger.child({ label: 'controllers/SellerProductController.js' });

const toSellerView = (product) => ({
  productId: product._id,
  name: product.name,
  description: product.description,
  price: product.price,
  stock: product.stock,
  category: product.category?.name,
  subcategories: product.subcategories,
  images: product.images,
  isActive: product.isActive,
});

/** Finds the category by name and checks every subcategory belongs to it. Throws 400 if not. */
const resolveCategory = async (categoryName, subcategories = []) => {
  const category = await Category.findOne({ name: categoryName }).lean();
  if (!category) {
    const available = await Category.distinct('name');
    throw new HttpError(400, `Invalid category. Available: ${available.join(', ')}`);
  }
  const allowed = new Set(category.subcategories.map((s) => s.toLowerCase()));
  // The old check was inverted: it rejected the *valid* subcategories.
  const invalid = subcategories.filter((sub) => !allowed.has(sub));
  if (invalid.length) {
    throw new HttpError(400, `Invalid subcategories: ${invalid.join(', ')}. Valid: ${category.subcategories.join(', ')}`);
  }
  return category;
};

const assertId = (id) => {
  if (!isValidId(id)) throw new HttpError(400, 'Invalid product id');
};

export const addProduct = async (req, res) => {
  const { name, description, price, stock, category: categoryName, subcategories } = req.body;
  const category = await resolveCategory(categoryName, subcategories);

  const product = await Product.create({
    seller: req.account._id,
    name,
    description,
    price,
    stock,
    category: { _id: category._id, name: category.name },
    subcategories,
    images: (req.files ?? []).map(toPublicPath),
  });
  productLogger.info(`Product ${product._id} added by seller ${req.account._id}`);

  res.status(201).json({ success: true, seller: req.account.name, product });
};

export const getSellerProduct = async (req, res) => {
  assertId(req.params.id);
  const product = await Product.findOne({ _id: req.params.id, seller: req.account._id }).lean();
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ success: true, product: toSellerView(product) });
};

// Only validated fields are applied (the old code passed req.body straight in, so `seller`/`isActive` could be set).
// New files in `images` are appended to the existing ones.
export const updateProduct = async (req, res) => {
  assertId(req.params.id);
  const product = await Product.findOne({ _id: req.params.id, seller: req.account._id });
  if (!product) throw new HttpError(404, 'Product not found/unauthorized');

  const { category: categoryName, subcategories, ...fields } = req.body;
  product.set(fields);

  if (categoryName || subcategories) {
    const category = await resolveCategory(categoryName ?? product.category.name, subcategories ?? product.subcategories);
    product.category = { _id: category._id, name: category.name };
    if (subcategories) product.subcategories = subcategories;
  }

  const newImages = (req.files ?? []).map(toPublicPath);
  if (product.images.length + newImages.length > MAX_PRODUCT_IMAGES) {
    throw new HttpError(400, `Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
  }
  product.images.push(...newImages);

  await product.save();
  res.json({ success: true, product });
};

// Was mounted without :id and returned a function's property, so it never worked.
export const updateProductImages = async (req, res) => {
  assertId(req.params.id);
  const files = req.files ?? [];
  if (!files.length) throw new HttpError(400, 'No images uploaded');

  // On any throw below, the error handler deletes the files multer already saved.
  const product = await Product.findOne({ _id: req.params.id, seller: req.account._id });
  if (!product) throw new HttpError(404, 'Product not found');
  if (product.images.length + files.length > MAX_PRODUCT_IMAGES) {
    throw new HttpError(400, `Maximum ${MAX_PRODUCT_IMAGES} images allowed (${MAX_PRODUCT_IMAGES - product.images.length} more)`);
  }

  product.images.push(...files.map(toPublicPath));
  await product.save();
  res.json({ success: true, images: product.images });
};

export const deactivateProduct = async (req, res) => {
  assertId(req.params.id);
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, seller: req.account._id },
    { isActive: false },
    { returnDocument: 'after' },
  );
  if (!product) throw new HttpError(404, 'Product not found');
  res.json({ success: true, message: 'Product deactivated' });
};

export const getSellerProducts = async (req, res) => {
  const { status = 'active' } = req.query;
  const products = await Product.find({ seller: req.account._id, isActive: status === 'active' })
    .sort('-createdAt')
    .lean();

  res.json({
    success: true,
    seller: req.account.name,
    totalProducts: products.length,
    products: products.map(toSellerView),
  });
};
