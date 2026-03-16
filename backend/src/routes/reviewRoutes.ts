import express from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';

const router = express.Router({ mergeParams: true });

router.post('/', createReview);
router.get('/', getProductReviews);

export default router;
