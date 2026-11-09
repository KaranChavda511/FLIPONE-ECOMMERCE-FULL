import express from 'express';
import { protect, userProtect } from '../../middlewares/AuthMiddleware.js';
import { authLimiter } from '../../middlewares/RateLimitMiddleware.js';
import { validator } from '../../middlewares/ValidationMiddleware.js';
import { profileImageUpload } from '../../utils/FileUploads.js';
import {
  userSignup,
  userLogin,
  verifyEmail,
  resendVerificationCode,
  getUserProfile,
  updateProfile,
  updateprofilePic,
  changePassword,
  likeProduct,
  getLikedProducts,
} from '../../controllers/UserControllers/UserController.js';

const router = express.Router();

router.post('/signup', authLimiter, validator('userSchemas.signup'), userSignup);
router.post('/login', authLimiter, validator('userSchemas.login'), userLogin);
// Email confirmation for new accounts (6-digit code by email).
router.post('/verify-email', authLimiter, validator('userSchemas.verifyEmail'), verifyEmail);
router.post('/resend-code', authLimiter, validator('userSchemas.resendCode'), resendVerificationCode);

router.use(protect, userProtect);

router.get('/profile', getUserProfile);
router.patch('/profile', validator('userSchemas.updateProfile'), updateProfile);
router.patch('/profile/picture', profileImageUpload, updateprofilePic);
router.patch('/profile/password', validator('userSchemas.changePasswordSchema'), changePassword);
router.post('/is-liked/:productId', likeProduct);
router.get('/likes', getLikedProducts);

export default router;
