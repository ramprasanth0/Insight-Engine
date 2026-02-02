import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

// Export a function or a lazy-loaded instance to prevent build-time errors
export const gemini = geminiApiKey
    ? new GoogleGenAI({ apiKey: geminiApiKey })
    : null as unknown as GoogleGenAI;