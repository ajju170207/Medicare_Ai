import { Router } from 'express';
import { chatWithDiseaseAI } from '../controllers/diseaseChatController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Secure chat route
router.post('/disease', protect, chatWithDiseaseAI);

export default router;
