//gemini.ts - google gemini AI client setup for embeddings and content generation

import { GoogleGenAI } from "@google/genai";

const geminiApiKey = process.env.GEMINI_API_KEY;

//export the raw client for direct usage (embeddings, etc)
export const gemini = geminiApiKey
    ? new GoogleGenAI({ apiKey: geminiApiKey })
    : null as unknown as GoogleGenAI;

//helper to get the models interface for tool calling
//usage: const response = await getGeminiModels().generateContent({...})
export function getGeminiModels() {
    if (!gemini) throw new Error("GEMINI_API_KEY not set - gemini client not initialized");
    return gemini.models;
}