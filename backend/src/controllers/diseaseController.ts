import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// @desc    Search / list diseases
// @route   GET /api/v1/diseases
// @access  Public
export const getDiseases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search = '', severity, specialist, page = 1, limit = 12 } = req.query;

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase.from('diseases').select('*', { count: 'exact' });

        if (search) {
            query = query.ilike('disease_name', `%${search}%`);
        }
        if (severity) {
            // Note: If you added a severity column, use it. Otherwise ignore.
        }
        if (specialist) {
            query = query.eq('specialist', specialist);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        res.status(200).json({
            success: true,
            count: data.length,
            total: count || 0,
            page: pageNum,
            pages: Math.ceil((count || 0) / limitNum),
            data,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single disease by slug (mapping slug to disease_name temporarily)
// @route   GET /api/v1/diseases/:slug
// @access  Public
export const getDiseaseBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        // The frontend passes a slug like 'fungal-infection'. Let's search by ilike.
        const nameQuery = (slug as string).replace(/-/g, ' ');

        const { data, error } = await supabase
            .from('diseases')
            .select('*')
            .ilike('disease_name', `%${nameQuery}%`)
            .single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Disease not found' });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
