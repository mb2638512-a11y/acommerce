import express from 'express';
import { createOrder, getStoreOrders, updateOrderStatus, getMyOrders } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public: Create order (Checkout)
router.post('/', createOrder);

// Protected: Store Admin
router.get('/my', authenticate, getMyOrders);
router.get('/:storeId', authenticate, getStoreOrders);
router.patch('/:storeId/:orderId', authenticate, updateOrderStatus);

export default router;
