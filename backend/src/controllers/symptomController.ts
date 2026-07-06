import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth.middleware';
import { analyzeSymptoms } from '../services/geminiService';
import { sendNotificationEmail } from '../services/emailService';
import { diseaseMappings } from '../utils/diseaseMapping';
import { supabase } from '../config/supabase';

// ML Service URL (Python Flask)
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5002';

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

        // 1. Call ML Microservice for prediction (with a short timeout to prevent slow responses)
        try {
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
                symptoms: Array.isArray(symptoms) ? symptoms : [symptoms]
            }, { timeout: 2000 }); // 2-second timeout
            mlPrediction = mlResponse.data;
        } catch (error: any) {
            console.error('ML Service unavailable or failed:', error.message);
        }

        // 2. Call Gemini for detailed analysis and validation
        if (!mlPrediction || !mlPrediction.disease) {
            try {
                const context = `Symptoms: ${symptoms}.`;
                geminiAnalysis = await analyzeSymptoms(context, duration, severity);
            } catch (err) {
                console.error('Gemini failed:', err);
            }
        } else {
            try {
                const context = `ML Predicted: ${mlPrediction.disease}. Symptoms: ${symptoms}.`;
                geminiAnalysis = await analyzeSymptoms(context, duration, severity);
            } catch (err) {
                console.error('Gemini enrichment failed:', err);
            }
        }

        if (!mlPrediction?.disease && (!geminiAnalysis || geminiAnalysis.primaryCondition === 'Consult a Doctor')) {
             res.status(500).json({ 
                 success: false, 
                 message: "AI Analysis failed: ML Service is unreachable and Gemini API key is invalid or expired. Please check your Render environment variables (ML_SERVICE_URL and GEMINI_API_KEY)." 
             });
             return;
        }

        // Combine results
        const finalResult = {
            primaryCondition: mlPrediction?.disease || geminiAnalysis?.primaryCondition || "Unknown",
            confidence: mlPrediction ? 0.98 : (geminiAnalysis?.conditions?.[0]?.confidence || 0),
            specialist: (geminiAnalysis?.specialist && geminiAnalysis.specialist !== "General Physician")
                ? geminiAnalysis.specialist
                : (mlPrediction?.disease ? (diseaseMappings[mlPrediction.disease]?.specialist || "General Physician") : "General Physician"),
            urgency: (geminiAnalysis?.urgency && geminiAnalysis.urgency !== "urgent")
                ? geminiAnalysis.urgency
                : (mlPrediction?.disease ? (diseaseMappings[mlPrediction.disease]?.urgency || "urgent") : "urgent"),
            description: mlPrediction?.description || geminiAnalysis?.conditions?.[0]?.description || "Information not available.",
            recommendations: [
                ...(mlPrediction?.precautions || []),
                ...(geminiAnalysis?.recommendations || [])
            ].filter(Boolean).slice(0, 5),
            disclaimer: "This AI assessment is for informational purposes only. Consult a doctor for accurate diagnosis.",
            details: {
                medications: mlPrediction?.medications || geminiAnalysis?.medications || [],
                diet: mlPrediction?.diet || geminiAnalysis?.diet || [],
                workout: mlPrediction?.workout || geminiAnalysis?.workout || [],
            }
        };

        let dbUrgency = 'low';
        const urgencyStr = (finalResult.urgency || 'non-urgent').toLowerCase();
        if (urgencyStr.includes('emergency') || urgencyStr === 'high' || urgencyStr === 'severe') {
            dbUrgency = 'high';
        } else if (urgencyStr.includes('urgent') || urgencyStr === 'medium' || urgencyStr === 'moderate') {
            dbUrgency = 'medium';
        }

        // 3. Save to Supabase User History
        const { data: history, error: historyError } = await supabase
            .from('user_history')
            .insert({
                user_id: req.user!.id,
                symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
                predicted_disease: finalResult.primaryCondition,
                chat_summary: JSON.stringify(finalResult)
            })
            .select()
            .single();

        if (historyError) console.error("Failed to save history to Supabase:", historyError);

        // 4. Create Notification
        const notificationTitle = 'New Symptom Analysis Ready';
        const notificationBody = `Your health analysis for ${finalResult.primaryCondition} is complete. Risk level: ${dbUrgency.toUpperCase()}.`;

        try {
            await supabase.from('notifications').insert({
                user_id: req.user!.id,
                title: notificationTitle,
                message: notificationBody,
                type: 'alert'
            });
            
            // Try fetch user email for notification
            const { data: userData } = await supabase.from('users').select('email').eq('id', req.user!.id).single();
            if (userData?.email) {
                await sendNotificationEmail(
                    userData.email,
                    notificationTitle,
                    notificationBody,
                    `<p>Analysis ready for ${finalResult.primaryCondition}.</p>`
                );
            }
        } catch (notifErr: any) {
            console.error('Failed to process notification/email:', notifErr.message);
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
        const { page = 1, limit = 20 } = req.query;
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const from = (pageNum - 1) * limitNum;
        const to = from + limitNum - 1;

        const { data, error, count } = await supabase
            .from('user_history')
            .select('*', { count: 'exact' })
            .eq('user_id', req.user!.id)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;

        // Process for frontend compatibility (parse chat_summary JSON if it exists)
        const formattedData = data.map((item: any) => ({
            ...item,
            result: item.chat_summary ? JSON.parse(item.chat_summary) : {},
            disease_name: item.predicted_disease
        }));

        res.status(200).json({
            success: true,
            count: data.length,
            data: formattedData,
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
        const userId = req.user!.id;

        // Fetch counts and recents
        const { count: total_checks } = await supabase.from('user_history').select('*', { count: 'exact', head: true }).eq('user_id', userId);
        const { data: recent_checks_raw } = await supabase.from('user_history').select('id, created_at, predicted_disease').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
        const { count: unread_notifications } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('read', false);
        const { data: daily_tip } = await supabase.from('daily_tips').select('*').limit(1).single();

        const recent_checks = recent_checks_raw?.map((check: any) => ({
            id: check.id,
            created_at: check.created_at,
            disease_name: check.predicted_disease,
        })) || [];

        const dashboardData = {
            total_checks: total_checks || 0,
            recent_checks,
            unread_notifications: unread_notifications || 0,
            daily_tip: daily_tip ? { tip_text: daily_tip.tip_text, id: daily_tip.id } : null
        };

        res.status(200).json({ success: true, data: dashboardData });
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
            .delete()
            .eq('id', id)
            .eq('user_id', req.user!.id);

        if (error) throw error;

        res.status(200).json({ success: true, message: 'History item deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
