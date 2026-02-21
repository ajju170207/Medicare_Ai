import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

// @desc    Get emergency contacts / hospitals by state/type
// @route   GET /api/v1/hospitals
// @access  Public
export const getHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state, type, district, limit = 20, page = 1 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase
            .from('emergency_contacts')
            .select('*', { count: 'exact' })
            .eq('is_active', true)
            .order('available_24h', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (state && state !== 'national') {
            query = query.or(`state.eq.${state},state.eq.national`);
        }
        if (type) {
            query = query.eq('type', type as string);
        }
        if (district) {
            query = query.ilike('district', `%${district}%`);
        }

        const { data, error, count } = await query;

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, count, data: data || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get nearby emergency contacts by coordinates
// @route   GET /api/v1/hospitals/nearby
// @access  Public
export const getNearbyHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lat, lng, radius = 10, type } = req.query;

        if (!lat || !lng) {
            res.status(400).json({ success: false, message: 'Please provide lat and lng coordinates' });
            return;
        }

        const { data, error } = await supabase.rpc('get_nearby_emergency', {
            user_lat: Number(lat),
            user_lng: Number(lng),
            radius_km: Number(radius),
            contact_type: type || null,
        });

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, count: data?.length || 0, data: data || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get national helplines
// @route   GET /api/v1/hospitals/helplines
// @access  Public
export const getHelplines = async (req: Request, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase
            .from('emergency_contacts')
            .select('*')
            .eq('state', 'national')
            .eq('is_active', true)
            .order('type');

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, count: data?.length || 0, data: data || [] });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
