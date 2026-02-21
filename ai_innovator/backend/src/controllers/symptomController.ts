import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth.middleware';
import { supabase } from '../config/supabase';
import { analyzeSymptoms } from '../services/geminiService';

// ML Service URL (Python Flask)
const ML_SERVICE_URL = 'http://localhost:5002';

// @desc    Analyze symptoms and save to history
// @route   POST /api/v1/symptoms/analyze
// @access  Private
export const analyzeUserSymptoms = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { symptoms, duration, severity, location, age, gender } = req.body;

        if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
            res.status(400).json({ success: false, message: 'Please provide symptoms' });
            return;
        }

        let mlPrediction = null;
        let geminiAnalysis = null;

        // 1. Call ML Microservice for prediction
        try {
            console.log(`Calling ML Service at ${ML_SERVICE_URL}/predict with symptoms:`, symptoms);
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
                symptoms: Array.isArray(symptoms) ? symptoms : [symptoms]
            });
            mlPrediction = mlResponse.data;
            console.log('ML Service response:', mlPrediction);
        } catch (error: any) {
            console.error('ML Service unavailable or failed:', error.message);
            if (error.response) {
                console.error('ML Service Error Data:', error.response.data);
            }
        }

        // 2. Call Gemini for detailed analysis and validation
        // We only use Gemini if ML fails or to get specialist/urgency info
        if (!mlPrediction || !mlPrediction.disease) {
            try {
                const context = `Symptoms: ${symptoms}.`;
                geminiAnalysis = await analyzeSymptoms(context, duration, severity);
            } catch (err) {
                console.error('Gemini failed:', err);
            }
        } else {
            // ML Succeeded. We might still want specialist info from Gemini if it's quick
            // but for now, let's prioritize the ML model's data.
            try {
                const context = `ML Predicted: ${mlPrediction.disease}. Symptoms: ${symptoms}.`;
                geminiAnalysis = await analyzeSymptoms(context, duration, severity);
            } catch (err) {
                console.error('Gemini enrichment failed:', err);
            }
        }

        // Combine results
        const finalResult = {
            primaryCondition: mlPrediction?.disease || geminiAnalysis?.primaryCondition || "Unknown",
            confidence: mlPrediction ? 0.98 : (geminiAnalysis?.conditions?.[0]?.confidence || 0),
            specialist: geminiAnalysis?.specialist || "General Physician",
            urgency: geminiAnalysis?.urgency || "non-urgent",
            description: mlPrediction?.description || geminiAnalysis?.conditions?.[0]?.description || "Information not available.",
            recommendations: [
                ...(mlPrediction?.precautions || []),
                ...(geminiAnalysis?.recommendations || [])
            ].filter(Boolean).slice(0, 5),
            disclaimer: "This AI assessment is for informational purposes only. Consult a doctor for accurate diagnosis.",
            details: {
                medications: mlPrediction?.medications || [],
                diet: mlPrediction?.diet || [],
                workout: mlPrediction?.workout || [],
            }
        };

        console.log('Final Result being sent to frontend:', JSON.stringify(finalResult, null, 2));

        // Map Gemini/ML urgency to database enums
        let dbSeverity: 'mild' | 'moderate' | 'severe' = 'mild';
        let dbUrgency: 'low' | 'medium' | 'high' = 'low';

        const urgencyStr = (finalResult.urgency || 'non-urgent').toLowerCase();
        if (urgencyStr.includes('emergency') || urgencyStr === 'high' || urgencyStr === 'severe') {
            dbSeverity = 'severe';
            dbUrgency = 'high';
        } else if (urgencyStr.includes('urgent') || urgencyStr === 'medium' || urgencyStr === 'moderate') {
            dbSeverity = 'moderate';
            dbUrgency = 'medium';
        } else {
            dbSeverity = 'mild';
            dbUrgency = 'low';
        }

        // 3. Save to Supabase
        const historyEntry = {
            user_id: req.user!.id,
            type: 'symptom_check' as const,
            input_data: { symptoms, duration, severity, location, age, gender },
            result: finalResult,
            disease_name: finalResult.primaryCondition,
            confidence: finalResult.confidence,
            severity: dbSeverity,
            urgency: dbUrgency,
        };

        const { data: history, error } = await supabase
            .from('user_history')
            .insert(historyEntry)
            .select()
            .single();

        if (error) {
            console.error('Failed to save history:', error.message);
        }

        res.status(200).json({
            success: true,
            data: { result: finalResult, history_id: history?.id },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user symptom/image check history
// @route   GET /api/v1/symptoms/history
// @access  Private
export const getUserHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { type, limit = 20, page = 1 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase
            .from('user_history')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user!.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (type) {
            query = query.eq('type', type);
        }

        const { data, error, count } = await query;

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({
            success: true,
            count,
            data,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard summary
// @route   GET /api/v1/symptoms/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data, error } = await supabase
            .rpc('get_user_dashboard', { p_user_id: req.user!.id });

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Soft delete a history item
// @route   DELETE /api/v1/symptoms/history/:id
// @access  Private
export const deleteHistoryItem = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('user_history')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', req.user!.id);

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, message: 'History item deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
