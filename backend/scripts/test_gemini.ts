import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const testGemini = async () => {
    try {
        console.log('Testing Gemini API key...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello, are you working?");
        console.log("Success! Response:", result.response.text());
    } catch (error: any) {
        console.error("Error testing Gemini:", error.message);
    }
}
testGemini();
