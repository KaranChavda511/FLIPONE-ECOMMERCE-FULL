import logger from '../services/logger.js';
import User from '../models/User.js';
import Seller from '../models/Seller.js';
import Admin from '../models/Admin.js';
import { verifyToken } from '../utils/generateToken.js';

const authLogger = logger.child({ label: 'middlewares/AuthMiddleware.js' });

const MODEL_BY_ROLE = { user: User, seller: Seller, admin: Admin };

const deny = (res, status, message) => res.status(status).json({ success: false, message });

// Authenticates any account type and attaches it as req.account.
export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return deny(res, 401, 'Authorization failed; Please log in to Access.');

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    authLogger.warn(`Token rejected: ${error.message}`);
    return deny(res, 401, 'Session expired. Please log in again');
  }

  const Model = MODEL_BY_ROLE[decoded.role];
  if (!Model) return deny(res, 401, 'Invalid account type');

  try {
    const account = await Model.findById(decoded.id);
    if (!account?.isActive) return deny(res, 401, 'Account unavailable or inactive');
    req.account = account;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (role, message) => (req, res, next) => {
  if (req.account?.role !== role) {
    authLogger.warn(`Forbidden: ${req.account?.role} tried a ${role}-only route ${req.method} ${req.originalUrl}`);
    return deny(res, 403, message);
  }
  next();
};

export const adminProtect = requireRole('admin', 'Admin access only');
export const sellerProtect = requireRole('seller', 'Seller account required');
export const userProtect = requireRole('user', 'User account required');
