// User account, profile and likes.
import User from '../../models/User.js';
import Product from '../../models/Product.js';
import generateToken from '../../utils/generateToken.js';
import { removeUpload } from '../../utils/FileUploads.js';
import { HttpError, isValidId } from '../../utils/helpers.js';
import logger from '../../services/logger.js';
import { confirmCode, issueCode, RESEND_SECONDS } from '../../services/emailVerification.js';

const userLogger = logger.child({ label: 'controllers/UserController.js' });

const publicUser = (user, token) => ({ id: user._id, name: user.name, email: user.email, ...(token && { token }) });

// Sign-up creates the account unconfirmed and emails a 6-digit code; no token until the code is confirmed
// (POST /verify-email). Signing up again with an unconfirmed email updates that account and sends a new code,
// so a shopper who closed the window, mistyped or lost the email is never stuck.
export const userSignup = async (req, res) => {
  const { name, email, password, mobile } = req.body;

  let user = await User.findOne({ email });
  if (user && user.emailVerified !== false) throw new HttpError(409, 'An account with this email already exists. Log in instead.');

  if (user) {
    user.set({ name, password, mobile });
    await user.save();
  } else {
    user = await User.create({ name, email, password, mobile, emailVerified: false });
    userLogger.info(`User created (email not yet confirmed): ${user._id}`);
  }

  const { resendIn } = await issueCode(user).catch((error) => {
    // A code sent moments ago is still valid: let the shopper enter it instead of failing the sign-up.
    if (error.statusCode === 429 && error.details?.retryAfter) return { resendIn: error.details.retryAfter };
    throw error;
  });

  res.status(201).json({ success: true, verificationRequired: true, email: user.email, resendIn });
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    userLogger.warn(`User login failed for ${email}`);
    throw new HttpError(401, 'Failed!, please check the email & password again');
  }
  if (!user.isActive) throw new HttpError(403, 'User is disabled');

  // Right password, unconfirmed email: send a code (unless one went out a moment ago) and ask for it.
  if (user.emailVerified === false) {
    const { resendIn } = await issueCode(user).catch((error) => {
      if (error.statusCode !== 429) throw error;
      return { resendIn: error.details?.retryAfter ?? RESEND_SECONDS };
    });
    return res.status(403).json({
      success: false,
      code: 'EMAIL_NOT_VERIFIED',
      email: user.email,
      resendIn,
      message: 'Confirm your email to log in. We sent you a 6-digit code.',
    });
  }

  res.json({ success: true, user: publicUser(user, generateToken(user._id, user.role)) });
};

// POST /api/user/verify-email { email, code } -> logs the shopper in.
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  // Same answer as a wrong code: this endpoint must not tell which emails have accounts.
  if (!user || user.emailVerified !== false) {
    throw new HttpError(400, 'That code is not right. Check the email and try again.', { details: { reason: 'wrong' } });
  }
  if (!user.isActive) throw new HttpError(403, 'User is disabled');

  await confirmCode(user, code);
  userLogger.info(`Email confirmed for user ${user._id}`);
  res.json({ success: true, user: publicUser(user, generateToken(user._id, user.role)) });
};

// POST /api/user/resend-code { email }. Answers the same whether or not the email has a pending account.
export const resendVerificationCode = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  let resendIn = RESEND_SECONDS;
  if (user && user.emailVerified === false && user.isActive) ({ resendIn } = await issueCode(user));
  res.json({ success: true, message: 'If this email is waiting for confirmation, a new code is on its way.', resendIn });
};

// req.account is the user loaded by `protect`, no second query needed. toJSON strips the password.
export const getUserProfile = async (req, res) => {
  res.json({ success: true, user: req.account });
};

// Body is validated (name/mobile/address only), so nothing else can be changed through it.
export const updateProfile = async (req, res) => {
  const user = req.account;
  user.set(req.body);
  await user.save();
  res.json({ success: true, user });
};

export const updateprofilePic = async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No image file provided');

  const user = req.account;
  const previous = user.profilePic;

  const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  user.profilePic = `${baseUrl}/uploads/${req.file.filename}`;
  await user.save();

  await removeUpload(previous).catch((error) => userLogger.warn(`Could not delete old profile picture: ${error.message}`));

  res.json({ success: true, message: 'Profile picture updated successfully', imageUrl: user.profilePic });
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  // Used req.user, which is never set, so this always crashed.
  const user = await User.findById(req.account._id).select('+password');

  if (!(await user.comparePassword(oldPassword))) throw new HttpError(400, 'Old password is incorrect');

  user.password = newPassword;
  await user.save();
  userLogger.info(`Password changed for user ${user._id}`);

  res.json({ success: true, message: 'Password updated successfully' });
};

// Toggles a like. $addToSet/$pull are atomic, so double clicks can't create duplicates.
export const likeProduct = async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) throw new HttpError(400, 'Invalid product id');
  if (!(await Product.exists({ _id: productId }))) throw new HttpError(404, 'Product not found');

  const liked = req.account.likedProducts.some((id) => id.equals(productId));
  await User.updateOne(
    { _id: req.account._id },
    liked ? { $pull: { likedProducts: productId } } : { $addToSet: { likedProducts: productId } },
  );

  res.json({ success: true, liked: !liked, message: `Product ${liked ? 'unliked' : 'liked'} successfully` });
};

export const getLikedProducts = async (req, res) => {
  const user = await User.findById(req.account._id)
    .select('likedProducts')
    .populate({ path: 'likedProducts', populate: { path: 'seller', select: 'name' } })
    .lean();

  res.json({ success: true, products: (user?.likedProducts ?? []).filter(Boolean) });
};
