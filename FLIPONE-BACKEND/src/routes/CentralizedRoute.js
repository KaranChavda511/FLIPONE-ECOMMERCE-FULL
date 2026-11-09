import express from 'express';
import { apiLimiter } from '../middlewares/RateLimitMiddleware.js';
import userRoutes from './UserRoutes/UserRoutes.js';
import productRoutes from './UserRoutes/ProductRoutes.js';
import cartRoutes from './CartOrderRoutes/CartRoutes.js';
import orderRoutes from './CartOrderRoutes/OrderRoutes.js';
import sellerRoutes from './SellerRoutes/SellerRoutes.js';
import adminRoutes from './AdminRoutes/AdminRoutes.js';

/**
 * All API routes, mounted under /api:
 *   /user     signup, login, profile, password, likes
 *   /product  public browsing, search, details, categories
 *   /cart     the logged-in user's cart
 *   /order    checkout, order history, cancellation
 *   /seller   seller auth, product management, seller orders
 *   /admin    admin auth, user/seller management, categories, analytics
 */
const centralizedRoute = express.Router();

centralizedRoute.use(apiLimiter);

centralizedRoute.use('/user', userRoutes);
centralizedRoute.use('/product', productRoutes);
centralizedRoute.use('/cart', cartRoutes);
centralizedRoute.use('/order', orderRoutes);
centralizedRoute.use('/seller', sellerRoutes);
centralizedRoute.use('/admin', adminRoutes);

export default centralizedRoute;
