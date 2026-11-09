// Seller management (by admin)
import Seller from '../../models/Seller.js';
import Product from '../../models/Product.js';
import { HttpError, searchRegex, isValidId, parsePagination } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const adminSellerLogger = logger.child({ label: 'controllers/AdminSellerController.js' });

export const getAllSellers = async (req, res) => {
  const { search } = req.query;
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 10 });
  const query = search
    ? { $or: [{ name: searchRegex(search) }, { email: searchRegex(search) }, { licenseID: searchRegex(search) }] }
    : {};

  const [sellers, total] = await Promise.all([
    Seller.find(query).sort('-createdAt').skip(skip).limit(limit).lean(),
    Seller.countDocuments(query),
  ]);

  res.json({ success: true, count: sellers.length, total, page, totalPages: Math.ceil(total / limit), sellers });
};

export const toggleSellerStatus = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid seller id');
  const seller = await Seller.findById(req.params.id);
  if (!seller) throw new HttpError(404, 'Seller not found');

  seller.isActive = !seller.isActive;
  await seller.save();

  // Was Seller.updateMany(...) plus an undefined `result`: products were never hidden and the request crashed.
  if (!seller.isActive) {
    const { modifiedCount } = await Product.updateMany({ seller: seller._id, isActive: true }, { isActive: false });
    adminSellerLogger.info(`Deactivated seller ${seller._id} and ${modifiedCount} of their products`);
  }

  res.json({
    success: true,
    message: `Seller ${seller.isActive ? 'activated' : 'deactivated'}`,
    isActive: seller.isActive,
  });
};
