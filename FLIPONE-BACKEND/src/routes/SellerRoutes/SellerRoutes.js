// src/routes/SellerRoutes/SellerRoutes.js
import express from 'express';
import { protect, sellerProtect } from '../../middlewares/AuthMiddleware.js';
import {  sellerSignup, sellerLogin } from '../../controllers/SellerController/SellerController.js'
import { 
  addProduct,
  updateProduct,
  updateProductImages,
  deactivateProduct,
  getSellerProducts
} from '../../controllers/SellerController/SellerProductController.js';
import {
  getSellerOrders,
  updateOrderStatus
} from '../../controllers/SellerController/sellerOrderController.js';
import { productImageUpload } from '../../utils/FileUploads.js';
import { errorHandler } from '../../middlewares/ErrorMiddleware.js'
import {validator} from '../../middlewares/ValidationMiddleware.js'



const router = express.Router();


// Seller Signup
router.post(
  "/signup",
  validator("sellerSchemas.signup"),
  sellerSignup
);

// Seller Login
router.post(
  "/login",
  validator("sellerSchemas.login"),
  sellerLogin
);


// Product Routes
router.get('/products',protect, sellerProtect, getSellerProducts);

router.post('/add-product', 
  protect, sellerProtect,
  productImageUpload, 
  // validator("productSchemas.create"),
  addProduct,
  // errorHandler ,  
);

router.patch('/products/:id', 
  protect, sellerProtect,
  productImageUpload,
  validator("productSchemas.update"),
  updateProduct,
  errorHandler
);

router.patch('/images',
  protect, sellerProtect,
  // errorHandler, 
  productImageUpload,
  updateProductImages
);

router.delete('/products/:id',protect, sellerProtect, deactivateProduct);


// Order Routes
router.get('/allOrders',protect, sellerProtect, getSellerOrders);
router.patch('/orders/:orderId/items/:itemId',protect, sellerProtect, updateOrderStatus);

export default router;