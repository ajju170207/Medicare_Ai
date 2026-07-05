import { Router } from 'express';
import { getUserNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(protect);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
