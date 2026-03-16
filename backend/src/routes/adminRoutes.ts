import express from 'express';
import {
    getPlatformStats,
    getAllUsers,
    getAllStores,
    deleteUser,
    deleteStore,
    toggleUserRole,
    getRevenueAnalytics,
    getAllOrders,
    getAllProducts,
    deleteProduct,
    toggleStoreMaintenance,
    getAudienceInsights,
    updateStorePlanByAdmin,
    getSystemLogs,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    getPlatformSettings,
    updatePlatformSettings
} from '../controllers/adminController';

import { authenticate, authorize } from '../middleware/auth';
import { requireSecretAdminEmail } from '../middleware/adminAccess';

const router = express.Router();

// All routes require admin access
router.use(authenticate);
router.use((req, res, next) => authorize(['admin'])(req, res, next));
router.use(requireSecretAdminEmail);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.get('/stores', getAllStores);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/audience', getAudienceInsights);
router.get('/orders', getAllOrders);
router.get('/products', getAllProducts);
router.delete('/users/:id', deleteUser);
router.delete('/stores/:id', deleteStore);
router.patch('/users/:id/role', toggleUserRole);
router.patch('/stores/:id/maintenance', toggleStoreMaintenance);
router.patch('/stores/:id/plan', updateStorePlanByAdmin);
router.delete('/products/:id', deleteProduct);

// System Management
router.get('/system/logs', getSystemLogs);
router.get('/system/api-keys', getApiKeys);
router.post('/system/api-keys', createApiKey);
router.delete('/system/api-keys/:id', deleteApiKey);

// Platform Settings
router.get('/settings', getPlatformSettings);
router.put('/settings', updatePlatformSettings);

export default router;

