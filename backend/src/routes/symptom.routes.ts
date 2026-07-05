import express from 'express';
import { analyzeUserSymptoms, getUserHistory, getDashboard, deleteHistoryItem } from '../controllers/symptomController';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.post('/analyze', analyzeUserSymptoms);
router.get('/history', getUserHistory);
router.get('/dashboard', getDashboard);
router.delete('/history/:id', deleteHistoryItem);

export default router;
