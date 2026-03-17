import express from 'express';
import { authenticate } from '../middleware/auth';
import { saveSearch, getSearchHistory, clearSearchHistory } from '../controllers/searchController';

const router = express.Router();

router.post('/', authenticate, saveSearch);
router.get('/', authenticate, getSearchHistory);
router.delete('/', authenticate, clearSearchHistory);

export default router;
