import Seller from '../../models/Seller.js';
import generateToken from '../../utils/generateToken.js';
import { generateUniqueLicenseID } from '../../services/idGenerator.js';
import { HttpError } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const sellerLogger = logger.child({ label: 'controllers/SellerController.js' });

export const sellerSignup = async (req, res) => {
  const { name, email, password } = req.body; // email already lower-cased by the validator

  const existing = await Seller.findOne({ $or: [{ name }, { email }] }).select('name').lean();
  if (existing) {
    throw new HttpError(409, existing.name === name ? 'Business name already exists' : 'Email already registered');
  }

  const licenseID = await generateUniqueLicenseID();
  const seller = await Seller.create({ licenseID, name, email, password });
  sellerLogger.info(`Seller created: ${seller._id}`);

  res.status(201).json({
    success: true,
    seller: { id: seller._id, name: seller.name, email: seller.email, licenseID: seller.licenseID },
  });
};

export const sellerLogin = async (req, res) => {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email }).select('+password');

  if (!seller || !(await seller.comparePassword(password))) {
    sellerLogger.warn(`Seller login failed for ${email}`);
    throw new HttpError(401, 'Failed!, please check the email & password again');
  }
  if (!seller.isActive) throw new HttpError(403, 'Your seller account has been disabled. Please contact admin.');

  res.json({
    success: true,
    seller: {
      id: seller._id,
      name: seller.name,
      email: seller.email,
      licenseID: seller.licenseID,
      token: generateToken(seller._id, seller.role),
    },
  });
};
