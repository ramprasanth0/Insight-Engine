//tavily.ts - tavily web search API client setup for real-time web results

import { tavily } from "@tavily/core";

const tavilyApiKey = process.env.TAVILY_API_KEY;
if (!tavilyApiKey) {
    throw new Error("TAVILY_API_KEY is not defined in the environment variables");
}
export const tavily_api = tavily({ apiKey: tavilyApiKey });
