import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth.middleware';
import UserHistory from '../models/UserHistory';
import Notification from '../models/Notification';
import DailyTip from '../models/DailyTip';
import { analyzeSymptoms } from '../services/geminiService';
import { sendNotificationEmail } from '../services/emailService';
import { diseaseMappings } from '../utils/diseaseMapping';

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

        // 1. Call ML Microservice for prediction
        try {
            const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
                symptoms: Array.isArray(symptoms) ? symptoms : [symptoms]
            });
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
                medications: mlPrediction?.medications || [],
                diet: mlPrediction?.diet || [],
                workout: mlPrediction?.workout || [],
            }
        };

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

        // 3. Save to MongoDB
        const historyEntry = new UserHistory({
            user_id: req.user!.id,
            type: 'symptom_check',
            input_data: { symptoms, duration, severity, location, age, gender },
            result: finalResult,
            disease_name: finalResult.primaryCondition,
            confidence: finalResult.confidence,
            severity: dbSeverity,
            urgency: dbUrgency,
        });

        const history = await historyEntry.save();

        // 4. Create Notification and Send Email
        const notificationTitle = 'New Symptom Analysis Ready';
        const notificationBody = `Your health analysis for ${finalResult.primaryCondition} is complete. Risk level: ${dbUrgency.toUpperCase()}.`;

        try {
            await Notification.create({
                user_id: req.user!.id,
                title: notificationTitle,
                body: notificationBody,
                type: 'alert',
                action_url: `/history/${history.id}`,
                metadata: { history_id: history.id, condition: finalResult.primaryCondition }
            });

            if (req.user!.email) {
                await sendNotificationEmail(
                    req.user!.email,
                    notificationTitle,
                    notificationBody,
                    `
                    <div style="font-family: sans-serif; color: #374151;">
                        <h2 style="color: #0d9488;">Health Analysis Ready</h2>
                        <p>Hello,</p>
                        <p>A new health assessment has been generated for you.</p>
                        <div style="background-color: #f0fdfa; padding: 20px; border-radius: 12px; border: 1px solid #ccfbf1;">
                            <p><strong>Primary Condition:</strong> ${finalResult.primaryCondition}</p>
                            <p><strong>Urgency:</strong> <span style="color: ${dbUrgency === 'high' ? '#ef4444' : '#0d9488'}; font-weight: bold;">${dbUrgency.toUpperCase()}</span></p>
                            <p><strong>Description:</strong> ${finalResult.description}</p>
                        </div>
                        <p style="margin-top: 20px; font-style: italic; color: #6b7280;">Disclaimer: This AI assessment is for informational purposes only. Consult a doctor for accurate diagnosis.</p>
                        <p>Best regards,<br/>Medicare AI Team</p>
                    </div>
                    `
                );
            }
        } catch (notifErr: any) {
            console.error('Failed to process notification/email:', notifErr.message);
        }

        res.status(200).json({
            success: true,
            data: { result: finalResult, history_id: history.id },
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
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        let query: any = { user_id: req.user!.id, deleted_at: null };

        if (type) {
            query.type = type;
        }

        const data = await UserHistory.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const count = await UserHistory.countDocuments(query);

        // Process for frontend compatibility
        const formattedData = data.map(item => ({
            ...item.toObject(),
            id: item._id, // map _id to id
            created_at: item.createdAt
        }));

        res.status(200).json({
            success: true,
            count,
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

        const [total_checks, recent_checks_raw, unread_notifications, daily_tip] = await Promise.all([
            UserHistory.countDocuments({ user_id: userId, deleted_at: null }),
            UserHistory.find({ user_id: userId, deleted_at: null })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('_id createdAt disease_name severity'),
            Notification.countDocuments({ user_id: userId, read: false }),
            DailyTip.findOne({ is_active: true, tip_date: { $lte: new Date() } })
                .sort({ tip_date: -1 })
        ]);

        const recent_checks = recent_checks_raw.map(check => ({
            id: check._id,
            created_at: check.createdAt,
            disease_name: check.disease_name,
            severity: check.severity
        }));

        const dashboardData = {
            total_checks,
            recent_checks,
            unread_notifications,
            daily_tip: daily_tip ? { tip_text: daily_tip.tip_text, id: daily_tip._id } : null
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

        const item = await UserHistory.findOneAndUpdate(
            { _id: id, user_id: req.user!.id },
            { deleted_at: new Date() }
        );

        if (!item) {
            res.status(404).json({ success: false, message: 'History item not found or unauthorized' });
            return;
        }

        res.status(200).json({ success: true, message: 'History item deleted' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
