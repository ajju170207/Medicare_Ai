import { Request, Response } from 'express';
import EmergencyContact from '../models/EmergencyContact';

// @desc    Get emergency contacts / hospitals by state/type
// @route   GET /api/v1/hospitals
// @access  Public
export const getHospitals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { state, type, district, limit = 20, page = 1 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        let query: any = { is_active: true };

        if (state && state !== 'national') {
            query.$or = [{ state }, { state: 'national' }];
        }
        if (type) {
            query.type = type;
        }
        if (district) {
            query.district = { $regex: district as string, $options: 'i' };
        }

        const data = await EmergencyContact.find(query)
            .sort({ available_24h: -1 })
            .skip(skip)
            .limit(limitNum);

        const count = await EmergencyContact.countDocuments(query);

        res.status(200).json({ success: true, count, data });
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

        const typeArray = type ? (type as string).split(',') : ['hospital'];

        const data = await EmergencyContact.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [Number(lng), Number(lat)] // [longitude, latitude]
                    },
                    distanceField: "distance_meters",
                    maxDistance: Number(radius) * 1000,
                    query: { is_active: true, type: { $in: typeArray } },
                    spherical: true
                }
            }
        ]);

        // Process data for frontend (distance in km, id mapped)
        const formattedData = data.map(item => ({
            ...item,
            id: item._id, // Map for compatibility if needed
            distance_km: item.distance_meters / 1000
        }));

        res.status(200).json({ success: true, count: formattedData.length, data: formattedData });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get national helplines
// @route   GET /api/v1/hospitals/helplines
// @access  Public
export const getHelplines = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = await EmergencyContact.find({ state: 'national', is_active: true }).sort('type');

        res.status(200).json({ success: true, count: data.length, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
