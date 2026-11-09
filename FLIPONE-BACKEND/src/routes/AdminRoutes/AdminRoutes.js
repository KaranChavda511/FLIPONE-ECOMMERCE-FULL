import express from 'express';
import { protect, adminProtect } from '../../middlewares/AuthMiddleware.js';
import { authLimiter } from '../../middlewares/RateLimitMiddleware.js';
import { validator } from '../../middlewares/ValidationMiddleware.js';
import { adminLogin, adminSignup, changeAdminPassword } from '../../controllers/AdminController/AdminController.js';
import { getAllUsers, getUserById, toggleUserStatus } from '../../controllers/AdminController/AdminUserController.js';
import { getAllSellers, toggleSellerStatus } from '../../controllers/AdminController/AdminSellerController.js';
import { createCategory, updateCategory, deleteCategory } from '../../controllers/AdminController/CategoryController.js';
import {
  getSalesData,
  getUserStatistics,
  getProductStatistics,
  getAllOrdersWithSellerInfo,
  getSellerSalesStats,
  getOrderStatusBreakdown,
  getCategorySales,
  getSignupGrowth,
} from '../../controllers/AdminController/AnalyticsController.js';
import { getAllActiveProducts } from '../../controllers/UserControllers/ProductController.js';

const router = express.Router();

router.post('/login', authLimiter, validator('adminSchemas.login'), adminLogin);

// Everything below needs a logged-in admin.
router.use(protect, adminProtect);

// Was public: anyone could create an admin account. Now only an admin can add another admin;
// the first admin is created with `npm run create-admin`.
router.post('/signup', validator('adminSchemas.signup'), adminSignup);
router.patch('/change-password', validator('adminSchemas.changePassword'), changeAdminPassword);

// Users
router.get('/allUsers', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/toggle-status', toggleUserStatus);

// Sellers
router.get('/allSellers', getAllSellers);
router.patch('/sellers/:id/toggle-status', toggleSellerStatus);

// Categories
router.post('/add-categories', validator('categorySchemas.create'), createCategory);
router.patch('/categories/:id', validator('categorySchemas.update'), updateCategory);
router.delete('/categories/:id', deleteCategory);

// Analytics
router.get('/analytics/sales', getSalesData);
router.get('/analytics/users', getUserStatistics);
router.get('/analytics/products', getProductStatistics);
router.get('/analytics/seller-orders', getAllOrdersWithSellerInfo);
router.get('/analytics/seller-sells', getSellerSalesStats);
router.get('/analytics/order-status', getOrderStatusBreakdown);
router.get('/analytics/categories', getCategorySales);
router.get('/analytics/growth', getSignupGrowth);

// Products
router.get('/product-list', getAllActiveProducts);

export default router;
