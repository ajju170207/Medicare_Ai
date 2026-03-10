import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Notification from '../models/Notification';

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = await Notification.find({ user_id: req.user!.id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const data = await Notification.findOneAndUpdate(
            { _id: id, user_id: req.user!.id },
            { read: true, read_at: new Date() },
            { new: true }
        );

        if (!data) {
            res.status(404).json({ success: false, message: 'Notification not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { user_id: req.user!.id, read: false },
            { read: true, read_at: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
