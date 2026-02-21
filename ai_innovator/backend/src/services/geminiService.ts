import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const analyzeSymptoms = async (
    inputContext: string,
    duration?: string,
    severity?: string
) => {
    const prompt = `
    You are a professional medical assistant AI.
    
    Context & Symptoms: ${inputContext}
    Duration: ${duration || 'Not specified'}
    Severity: ${severity || 'Not specified'}

    Please analyze the provided context (which may include a prediction from an ML model) and symptoms. Provide the following in JSON format:
    1. primaryCondition: The most likely condition name. (If ML prediction is present and reasonable, use it; otherwise infer from symptoms).
    2. conditions: A list of 3-5 possible conditions with name, confidence (0-1), and a brief description.
    3. specialist: The type of medical specialist to consult (e.g., Dermatologist, Cardiologist, General Physician).
    4. urgency: One of 'emergency', 'urgent', or 'non-urgent'.
    5. recommendations: A list of 3-5 recommended next steps (home remedies, doctor visit, etc.).
    6. disclaimer: A clear, professional medical disclaimer.

    Format your response as a single, valid JSON object ONLY. Do not include any text before or after the JSON.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        return JSON.parse(responseText);

    } catch (error: any) {
        console.error('Gemini Analysis Error:', error);
        // Return a safe fallback to prevent crashing
        return {
            primaryCondition: "Consult a Doctor",
            conditions: [],
            urgency: "urgent",
            recommendations: ["Seek medical attention immediately if symptoms persist."],
            disclaimer: "AI analysis failed. Please consult a healthcare professional."
        };
    }
};

export const chatWithAI = async (message: string, history: any[] = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (error: any) {
        console.error('Gemini Chat Error:', error);
        return "I'm having trouble connecting right now. Please try again later.";
    }
};
