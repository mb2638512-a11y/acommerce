import express from 'express';
import { generateContent } from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Protected route to prevent abuse
router.post('/generate', authenticate, generateContent);

export default router;
