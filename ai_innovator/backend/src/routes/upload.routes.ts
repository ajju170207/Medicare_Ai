import express from 'express';
import multer from 'multer';
import { uploadFile } from '../services/s3Service';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// @desc    Upload profile picture
// @route   POST /api/v1/upload/avatar
// @access  Private (protect applied in server.ts)
router.post('/avatar', upload.single('image'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const imageUrl = await uploadFile(
            req.file.buffer,
            req.file.originalname,
            req.file.mimetype
        );

        // Update user avatar in MongoDB
        await User.findByIdAndUpdate(req.user!.id, { avatar_url: imageUrl });

        res.status(200).json({
            success: true,
            data: imageUrl,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
