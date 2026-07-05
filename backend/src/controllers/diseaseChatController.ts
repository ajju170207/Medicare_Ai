import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Load dataset CSVs once at startup
const DATASET_DIR = path.resolve(__dirname, '../../../ml_service/dataset');

function loadCsv(filename: string): string {
    try {
        const filePath = path.join(DATASET_DIR, filename);
        return fs.readFileSync(filePath, 'utf-8').trim();
    } catch (e) {
        return '';
    }
}

const descriptions = loadCsv('description.csv');
const diets = loadCsv('diets.csv');
const medications = loadCsv('medications.csv');
const precautions = loadCsv('precautions_df.csv');
const workouts = loadCsv('workout_df.csv');
const symptomSeverity = loadCsv('Symptom-severity.csv');

// Build a concise dataset context string to pass to Gemini
function buildDatasetContext(): string {
    return `
You are a Medical Knowledge Assistant for Medicare AI.
You have access to the following real medical datasets for 41 diseases. Use this data to answer user questions accurately.

=== DISEASE DESCRIPTIONS ===
${descriptions}

=== MEDICATIONS PER DISEASE ===
${medications}

=== DIET RECOMMENDATIONS PER DISEASE ===
${diets}

=== PRECAUTIONS PER DISEASE ===
${precautions}

=== WORKOUT RECOMMENDATIONS PER DISEASE ===
${workouts}

=== SYMPTOM SEVERITY WEIGHTS ===
${symptomSeverity}

IMPORTANT GUIDELINES:
- Always answer based on the datasets above when relevant.
- Be professional, empathetic, and concise.
- If a disease or topic isn't in the dataset, use your general medical knowledge.
- ALWAYS end with: "⚠️ This is AI-generated content. Please consult a qualified doctor for medical advice."
`.trim();
}

const DATASET_CONTEXT = buildDatasetContext();

/**
 * @desc    Chat with medical AI about diseases and datasets
 * @route   POST /api/v1/chat/disease
 */
export const chatWithDiseaseAI = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            res.status(400).json({ success: false, message: 'Message is required' });
            return;
        }

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: DATASET_CONTEXT }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am the Medicare AI Knowledge Assistant. I have access to disease descriptions, medications, diets, precautions, workouts, and symptom severity data for 41 conditions. I will provide accurate, dataset-backed medical information and always include a safety disclaimer." }],
                },
                ...history.map((h: any) => ({
                    role: h.role === 'user' ? 'user' : 'model',
                    parts: [{ text: h.content }],
                })),
            ],
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.status(200).json({
            success: true,
            data: responseText,
        });
    } catch (error: any) {
        console.error('Chat AI Error:', error);
        res.status(500).json({ success: false, message: 'Failed to get response from AI: ' + error.message });
    }
};
