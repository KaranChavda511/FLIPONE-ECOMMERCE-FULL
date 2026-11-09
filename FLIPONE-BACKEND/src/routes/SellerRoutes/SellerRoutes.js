import express from 'express';
import { protect, sellerProtect } from '../../middlewares/AuthMiddleware.js';
import { authLimiter } from '../../middlewares/RateLimitMiddleware.js';
import { validator } from '../../middlewares/ValidationMiddleware.js';
import { productImageUpload } from '../../utils/FileUploads.js';
import { sellerSignup, sellerLogin } from '../../controllers/SellerController/SellerController.js';
import {
  addProduct,
  updateProduct,
  updateProductImages,
  deactivateProduct,
  getSellerProducts,
  getSellerProduct,
} from '../../controllers/SellerController/SellerProductController.js';
import { getSellerOrders, updateOrderStatus } from '../../controllers/SellerController/sellerOrderController.js';
import { getSellerAnalytics } from '../../controllers/SellerController/SellerAnalyticsController.js';

const router = express.Router();

router.post('/signup', authLimiter, validator('sellerSchemas.signup'), sellerSignup);
router.post('/login', authLimiter, validator('sellerSchemas.login'), sellerLogin);

router.use(protect, sellerProtect);

// Products. multer runs before the validator so multipart text fields are in req.body.
router.get('/products', getSellerProducts);
router.get('/products/:id', getSellerProduct);
router.post('/add-product', productImageUpload, validator('productSchemas.create'), addProduct);
router.patch('/products/:id', productImageUpload, validator('productSchemas.update'), updateProduct);
router.patch('/products/:id/images', productImageUpload, updateProductImages);
router.delete('/products/:id', deactivateProduct);

// Analytics (own items only)
router.get('/analytics', getSellerAnalytics);

// Orders
router.get('/allOrders', getSellerOrders);
router.patch('/orders/:orderId/items/:itemId', validator('sellerOrderSchemas.updateStatus'), updateOrderStatus);

export default router;
