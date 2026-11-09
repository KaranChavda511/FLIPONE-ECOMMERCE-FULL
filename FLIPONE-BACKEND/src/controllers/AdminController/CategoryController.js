// Category management (by admin)
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import { HttpError, isValidId } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const categoryLogger = logger.child({ label: 'controllers/CategoryController.js' });

// Body already validated: subcategories is a clean array (JSON string, array or CSV accepted).
export const createCategory = async (req, res) => {
  const { name, subcategories } = req.body;

  if (await Category.exists({ name })) throw new HttpError(409, 'Category name already exists');

  const category = await Category.create({ name, subcategories, createdBy: req.account._id });
  categoryLogger.info(`Category ${category._id} created`);

  res.status(201).json({ success: true, category });
};

export const updateCategory = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid category id');

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!category) throw new HttpError(404, 'Category not found');

  // Products keep a copy of the category name; keep it in sync on rename.
  if (req.body.name) {
    await Product.updateMany({ 'category._id': category._id }, { 'category.name': category.name });
  }

  res.json({ success: true, category });
};

export const deleteCategory = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid category id');
  const category = await Category.findById(req.params.id);
  if (!category) throw new HttpError(404, 'Category not found');

  // Was { category: id }, which never matches the embedded {_id, name}, so categories in use could be deleted.
  if (await Product.exists({ 'category._id': category._id })) {
    throw new HttpError(400, 'Category cannot be deleted as it has associated products');
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted successfully' });
};
