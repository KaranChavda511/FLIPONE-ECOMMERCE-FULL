// src/routes/AdminRoutes/AdminRoutes.js
import express from "express";
import { protect, adminProtect } from "../../middlewares/AuthMiddleware.js";
import { adminLogin, adminSignup,changeAdminPassword } from "../../controllers/AdminController/AdminController.js";
import {
  getAllUsers,
  toggleUserStatus,
} from "../../controllers/AdminController/AdminUserController.js";
import {
  getAllSellers,
  toggleSellerStatus,
} from "../../controllers/AdminController/AdminSellerController.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../controllers/AdminController/CategoryController.js";
import {
  getSalesData,
  getUserStatistics,
  getProductStatistics,
  getAllOrdersWithSellerInfo,
  getSellerSalesStats
} from "../../controllers/AdminController/AnalyticsController.js";
import { validator } from "../../middlewares/ValidationMiddleware.js";
import { getSellerProducts } from "../../controllers/SellerController/SellerProductController.js";
import { getAllActiveProducts } from "../../controllers/UserControllers/ProductController.js";

const router = express.Router();

// Admin Login
router.post(
  "/login",
  validator("adminSchemas.login"),
  adminLogin
);

// admin signup
router.post(
  "/signup",
  validator("adminSchemas.signup"),
  adminSignup
);

// Add to routes
router.patch(
  '/change-password',
  protect,
  adminProtect,
  validator("adminSchemas.changePassword"),
  changeAdminPassword
);

// User Management
router.get("/allUsers", protect, adminProtect, getAllUsers);
router.patch(
  "/users/:id/toggle-status",
  protect,
  adminProtect,
  toggleUserStatus
);

// Seller Management
router.get("/allSellers", protect, adminProtect, getAllSellers);

router.patch(
  "/sellers/:id/toggle-status",
  protect,
  adminProtect,
  toggleSellerStatus
);

// Category Management
router.post(
  "/add-categories",
  protect,
  adminProtect,
  // validator("categorySchemas.create"),
  createCategory
);

router.patch(
  "/categories/:id",
  protect,
  adminProtect,
  validator("categorySchemas.update"),
  updateCategory
);

router.delete("/categories/:id", protect, adminProtect, deleteCategory);

// Analytics
router.get("/analytics/sales", protect, adminProtect, getSalesData);
router.get("/analytics/users", protect, adminProtect, getUserStatistics);
router.get("/analytics/products", protect, adminProtect, getProductStatistics);

router.get("/analytics/seller-orders", protect, adminProtect, getAllOrdersWithSellerInfo);
router.get("/analytics/seller-sells", protect, adminProtect, getSellerSalesStats);


// product
router.get("/product-list", protect, adminProtect, getAllActiveProducts);


export default router;
  