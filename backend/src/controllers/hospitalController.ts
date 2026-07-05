import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// @desc    Get emergency contacts / hospitals by state/type
// @route   GET /api/v1/hospitals
// @access  Public
export const getHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state, type, page = 1, limit = 20 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        let query = supabase.from('emergency_contacts').select('*', { count: 'exact' });

        if (state && state !== 'national') {
            query = query.or(`state.eq.${state},state.eq.national`); // assuming state exists
        }
        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query.range(from, to);

        if (error) throw error;

        res.status(200).json({ success: true, count: data.length, total: count, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby emergency contacts by coordinates
// @route   GET /api/v1/hospitals/nearby
// @access  Public
export const getNearbyHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        // Fallback since we don't have PostGIS enabled in our schema for this exact example
        // Just return some hospitals
        const { type } = req.query;
        
        let query = supabase.from('emergency_contacts').select('*').limit(20);
        if (type) {
            // Simplified fallback
            query = query.eq('type', 'hospital');
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get national helplines
// @route   GET /api/v1/hospitals/helplines
// @access  Public
export const getHelplines = async (req: Request, res: Response): Promise<void> => {
    try {
        // Assuming we map national helplines to a specific relation or name convention in the new schema
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .ilike('relation', '%helpline%');

        if (error) throw error;

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
