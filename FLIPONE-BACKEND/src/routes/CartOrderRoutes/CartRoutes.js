import express from 'express';
import { protect, userProtect } from '../../middlewares/AuthMiddleware.js';
import { validator } from '../../middlewares/ValidationMiddleware.js';
import { getCart, addToCart, updateCart, removeFromCart, clearCart } from '../../controllers/CartOrderControllers/CartController.js';

const router = express.Router();

router.use(protect, userProtect);

router.get('/view', getCart);
router.post('/addIn', validator('cartSchemas.addItem'), addToCart);
router.delete('/clear', clearCart);
router.patch('/updateCart/:itemId', validator('cartSchemas.updateItem'), updateCart);
router.delete('/deleteItems/:itemId', removeFromCart);

export default router;
