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
            query = query.ilike('name', `%${search}%`);
        }
        if (severity) {
            // Note: If you added a severity column, use it. Otherwise ignore.
        }
        if (specialist) {
            query = query.eq('specialist_type', specialist);
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

export const getDiseaseBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const slugStr = String(slug);
        
        // Check if the param is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugStr);

        let query = supabase.from('diseases').select('*');

        if (isUUID) {
            query = query.eq('id', slugStr);
        } else {
            // Try matching by the new slug column first
            const { data: slugData, error: slugError } = await supabase
                .from('diseases')
                .select('*')
                .eq('slug', slugStr)
                .single();

            if (!slugError && slugData) {
                res.status(200).json({ success: true, data: slugData });
                return;
            }

            // Fallback to searching by name if slug didn't match (for older data)
            const nameQuery = (slug as string).replace(/-/g, ' ');
            query = query.ilike('name', `%${nameQuery}%`);
        }

        const { data, error } = await query.single();

        if (error || !data) {
            res.status(404).json({ success: false, message: 'Disease not found' });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
