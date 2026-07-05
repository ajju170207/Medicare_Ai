import { Request, Response } from 'express';
import Disease from '../models/Disease';

// @desc    Search / list diseases
// @route   GET /api/v1/diseases
// @access  Public
export const getDiseases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search = '', severity, specialist, page = 1, limit = 12 } = req.query;

        let query: any = { is_active: true };
        
        if (search) {
            query.$text = { $search: String(search) };
        }
        if (severity) {
            query.severity = severity;
        }
        if (specialist) {
            query.specialist_type = specialist;
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const data = await Disease.find(query)
            .skip(skip)
            .limit(limitNum);
            
        const total = await Disease.countDocuments(query);

        res.status(200).json({
            success: true,
            count: data.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single disease by slug
// @route   GET /api/v1/diseases/:slug
// @access  Public
export const getDiseaseBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;

        const data = await Disease.findOne({ slug, is_active: true });

        if (!data) {
            res.status(404).json({ success: false, message: 'Disease not found' });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
