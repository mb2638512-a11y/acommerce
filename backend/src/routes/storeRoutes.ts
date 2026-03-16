import express from 'express';
import { createStore, getMyStores, getStores, getStoreById, getStoreAdminDetails, getStoreFeatures } from '../controllers/storeController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public Routes
router.get('/my/all', authenticate, getMyStores);
router.get('/', getStores);
router.get('/:id', getStoreById);

// Protected Routes
router.post('/', authenticate, createStore);
router.get('/:id/admin', authenticate, getStoreAdminDetails);
router.get('/:storeId/features', authenticate, getStoreFeatures);

export default router;
