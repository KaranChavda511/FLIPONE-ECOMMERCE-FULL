// User management (by admin)
import User from '../../models/User.js';
import { HttpError, searchRegex, isValidId } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const adminUserLogger = logger.child({ label: 'controllers/AdminUserController.js' });

export const getAllUsers = async (req, res) => {
  const { search } = req.query;
  const query = search
    ? { $or: [{ name: searchRegex(search) }, { email: searchRegex(search) }] }
    : {};

  // password is select:false on the model, so hashes are no longer sent to the browser.
  const users = await User.find(query).select('-likedProducts').sort('-createdAt').lean();

  res.json({ success: true, total: users.length, users });
};

export const getUserById = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid user id');
  const user = await User.findById(req.params.id).lean();
  if (!user) throw new HttpError(404, 'User not found');
  res.json({ success: true, user });
};

export const toggleUserStatus = async (req, res) => {
  if (!isValidId(req.params.id)) throw new HttpError(400, 'Invalid user id');
  const user = await User.findById(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');

  user.isActive = !user.isActive;
  await user.save();
  adminUserLogger.info(`User ${user._id} ${user.isActive ? 'activated' : 'deactivated'} by ${req.account._id}`);

  res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
};
