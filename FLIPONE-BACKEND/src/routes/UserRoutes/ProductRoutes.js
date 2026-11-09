import express from 'express';
import {
  getAllActiveProducts,
  searchProducts,
  getProductDetails,
  getAllCategories,
} from '../../controllers/UserControllers/ProductController.js';

const router = express.Router();

// Public, no authentication. Fixed paths must come before '/:id'.
router.get('/', getAllActiveProducts);
router.get('/search', searchProducts);
router.get('/categories', getAllCategories);
router.get('/product/:id', getProductDetails); // old path, kept for compatibility
router.get('/:id', getProductDetails);

export default router;
