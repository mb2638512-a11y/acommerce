import express from 'express';
import { createProduct, deleteProduct, getStoreProducts, updateProduct } from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { requireProductVariants, requireBundleProducts } from '../middleware/featureGate';

const router = express.Router({ mergeParams: true });

router.get('/', getStoreProducts);
router.post('/', authenticate, createProduct);
router.patch('/:productId', authenticate, requireProductVariants, updateProduct);
router.delete('/:productId', authenticate, deleteProduct);

export default router;
