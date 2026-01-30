import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables");
}
export const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
