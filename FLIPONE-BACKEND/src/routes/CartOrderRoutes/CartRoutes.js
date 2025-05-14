

import express from 'express';
import { protect, userProtect } from '../../middlewares/AuthMiddleware.js';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} from '../../controllers/CartOrderControllers/CartController.js';

const router = express.Router();

router.use(protect, userProtect);   

router.get('/view', getCart);
router.post('/addIn', addToCart);
router.delete('/clear', clearCart);


router.patch('/updateCart/:itemId', updateCart);
router.delete('/deleteItems/:itemId', removeFromCart);


export default router;