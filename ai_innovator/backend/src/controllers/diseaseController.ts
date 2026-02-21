import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// @desc    Search / list diseases
// @route   GET /api/v1/diseases
// @access  Public
export const getDiseases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search = '', severity, specialist, page = 1, limit = 12 } = req.query;

        const { data, error } = await supabase.rpc('search_diseases', {
            search_query: String(search),
            filter_severity: severity || null,
            filter_specialist: specialist || null,
            page_num: Number(page),
            page_size: Number(limit),
        });

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        const total = data?.[0]?.total_count || 0;

        res.status(200).json({
            success: true,
            count: data?.length || 0,
            total: Number(total),
            page: Number(page),
            pages: Math.ceil(Number(total) / Number(limit)),
            data: data || [],
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

        const { data, error } = await supabase
            .from('disease_library')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
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
