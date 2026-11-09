import Admin from '../../models/Admin.js';
import generateToken from '../../utils/generateToken.js';
import { HttpError } from '../../utils/helpers.js';
import logger from '../../services/logger.js';

const adminLogger = logger.child({ label: 'controllers/AdminController.js' });

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  // One message for unknown email and wrong password, so emails can't be enumerated.
  if (!admin || !(await admin.comparePassword(password))) {
    adminLogger.warn(`Admin login failed for ${email}`);
    throw new HttpError(401, 'Invalid email or password');
  }
  if (!admin.isActive) throw new HttpError(403, 'This admin account is disabled');

  res.json({
    success: true,
    token: generateToken(admin._id, admin.role),
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
};

// Admin-only (see AdminRoutes): an existing admin adds another admin.
export const adminSignup = async (req, res) => {
  const { name, email, password } = req.body;

  if (await Admin.exists({ email })) throw new HttpError(409, 'admin already exists with this email');

  const admin = await Admin.create({ name, email, password });
  adminLogger.info(`Admin ${admin._id} created by ${req.account._id}`);

  res.status(201).json({
    success: true,
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
};

export const changeAdminPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // Used req.admin, which never existed, so this always failed.
  const admin = await Admin.findById(req.account._id).select('+password');

  if (!(await admin.comparePassword(oldPassword))) throw new HttpError(401, 'Old password is incorrect');

  admin.password = newPassword;
  await admin.save();
  adminLogger.info(`Password changed for admin ${admin._id}`);

  res.json({
    success: true,
    message: 'Password updated successfully',
    token: generateToken(admin._id, admin.role),
  });
};
