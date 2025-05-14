// src/routes/UserRoutes/UserRoutes.js
import express from 'express';
import { protect, userProtect } from '../../middlewares/AuthMiddleware.js';
import {
  userSignup,
  userLogin,
  getUserProfile,
  updateProfile,
  updateprofilePic,
  changePassword,
  likeProduct,
  getLikedProducts
} from '../../controllers/UserControllers/UserController.js';
import { errorHandler } from '../../middlewares/ErrorMiddleware.js';
import { profileImageUpload } from '../../utils/FileUploads.js';
import {validator} from '../../middlewares/ValidationMiddleware.js'


const router = express.Router();

// Apply authentication middleware to all routes
// router.use(protect, userProtect,);

// Define routes

// User Signup
router.post(
  "/signup",
  validator("userSchemas.signup"),
  userSignup
);

// User Login
router.post(
  "/login",
  validator("userSchemas.login"),
  userLogin
);

router.get('/profile' ,protect, userProtect, getUserProfile);
router.patch('/profile',protect, userProtect,validator("userSchemas.updateProfile"), updateProfile); 
router.patch('/profile/picture', 
  protect, userProtect,
  profileImageUpload,
  updateprofilePic
);
router.patch(
  '/profile/password',
  protect, userProtect,
  validator("userSchemas.changePasswordSchema"),
  changePassword
);

router.post('/is-liked/:productId', protect, userProtect, likeProduct);
router.get('/likes', protect, userProtect, getLikedProducts);


// Global error handler (must be the last middleware)
router.use(errorHandler);

export default router;