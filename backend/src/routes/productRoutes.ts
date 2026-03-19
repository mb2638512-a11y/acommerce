import express from 'express';
import { createProduct, deleteProduct, getStoreProducts, updateProduct, addVirtualProduct, getMarketplaceProducts } from '../controllers/productController';
import { authenticate, authenticateOptional } from '../middleware/auth';
import { requireProductVariants, requireBundleProducts } from '../middleware/featureGate';

const router = express.Router({ mergeParams: true });

// Public route to browse marketplace for dropshipping
router.get('/marketplace', authenticateOptional, getMarketplaceProducts);

// Add product from marketplace to own store (Virtual/Dropship inventory)
router.post('/virtual', authenticate, addVirtualProduct);

router.get('/', getStoreProducts);
router.post('/', authenticate, createProduct);
router.patch('/:productId', authenticate, requireProductVariants, updateProduct);
router.delete('/:productId', authenticate, deleteProduct);

export default router;
