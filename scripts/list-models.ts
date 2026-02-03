import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config({ path: ".env.local" });

async function listModels() {
    console.log('📋 Fetching available Gemini models...\n');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env.local');
        process.exit(1);
    }

    const client = new GoogleGenAI({ apiKey });

    try {
        const models = await client.models.list();

        console.log('✅ Available Models:\n');
        console.log('─'.repeat(60));

        for await (const model of models) {
            console.log(`📌 ${model.name}`);
            if (model.displayName) console.log(`   Display: ${model.displayName}`);
            if (model.description) console.log(`   Desc: ${model.description?.substring(0, 80)}...`);
            console.log('─'.repeat(60));
        }

    } catch (error: any) {
        console.error('❌ Error fetching models:', error.message);
    }
}

listModels();
