//route.ts - chat API endpoint that handles user queries, embeds them, searches pinecone, and streams gemini responses

export const dynamic = 'force-dynamic'; //force dynamic caching

import { gemini } from "@/lib/gemini";
import { mcpToTool } from "@google/genai";
import { pinecone } from "@/lib/pinecone";
import { tavily_api } from "@/lib/tavily";
import { getMCPClient } from "@/lib/mcp";
import { NextResponse } from "next/server";

//get user request

export async function POST(req: Request) {
    try {
        const { messages, namespaces, webSearch } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        console.log(`✅ User Query received: "${lastMessage}"`);
        console.log(`✅ Selected Namespaces: ${namespaces?.length ? namespaces.join(", ") : "ALL (default)"}`);

        //setup client (setup of clients is done in the lib folder)
        const client = gemini;
        const pc = pinecone;

        //embed the user query
        const embeddingResponse = await client.models.embedContent({
            model: "text-embedding-004",
            contents: [{ parts: [{ text: lastMessage }] }],
        })
        const queryVector = embeddingResponse.embeddings?.[0].values
        if (!queryVector) {
            throw new Error("Failed to generate embedding")
        }
        console.log("✅ Query Vector created");

        // Determine which namespaces to query
        const targetNamespaces = (namespaces && namespaces.length > 0)
            ? namespaces
            : ["nextjs-docs", "reactjs-docs"];

        // Parallel query for all targeted namespaces
        const queryPromises = targetNamespaces.map((ns: string) =>
            //search user selected namespaces 
            pc.index("insight-engine-index").namespace(ns).query({
                topK: 5, // Reduce topK per namespace since we are aggregating
                vector: queryVector,
                includeMetadata: true
            })
        );
        console.log(`🔍 Searching namespace: ${targetNamespaces}`);


        //wait for all queries to complete
        const queryResponses = await Promise.all(queryPromises);
        console.log("✅ Query Responses received");

        // Aggregate matches from all namespace queries (flatmap is used to flatten the array of arrays)
        const allMatches = queryResponses.flatMap(response => response.matches || []);

        // Build context from the aggregated search results
        const docsContext = allMatches
            .map((match) => match.metadata?.text)
            .filter(Boolean)
            .join("\n\n");

        console.log(`✅ Context built with ${allMatches.length} matches - Docs context`);


        ///==================== OPTION A: Direct Tavily API (COMMENTED OUT) ====================///
        //uncomment this section and comment out MCP section below to use direct API
        // let webSearchContext = "";
        // if (webSearch) {
        //     const tavilyResponses = await tavily_api.search(
        //         lastMessage, {
        //         max_results: 5
        //     }
        //     )
        //     webSearchContext = tavilyResponses.results.map((res) => res.content).join("\n\n")
        //     console.log(`✅ Context built with ${tavilyResponses.results.length} matches - Tavily (Web search) context`);
        // }
        ///==================== END OPTION A ====================///


        ///==================== OPTION B: MCP Tool Calling (ACTIVE) ====================///
        //Agentic flow using mcpToTool() - Gemini SDK's built-in MCP integration
        //This automatically converts MCP tools to Gemini format and handles execution
        let mcpWebSearchContext = "";
        if (webSearch) {
            //SETUP: Get MCP client (already connected)
            const mcpClient = await getMCPClient();
            console.log(`✅ MCP client connected`);

            try {
                //GENERATE: Use mcpToTool() to integrate MCP tools with Gemini
                //This handles tool conversion and automatic function calling
                //Retry logic for rate limits and model availability
                const searchModels = [
                    "gemini-3-flash-preview",           // primary - latest and fastest (20 RPD)
                    "gemini-2.5-flash",                 // secondary - stable and reliable (15 RPD)
                    "gemini-2.0-flash"                  // fallback - older but still works (15 RPD)
                ];

                for (const model of searchModels) {
                    try {
                        console.log(`🔍 Attempting web search agent with model: ${model}`);
                        const response = await client.models.generateContent({
                            model: model,
                            contents: `Search the web for information about: ${lastMessage}`,
                            config: {
                                tools: [mcpToTool(mcpClient)],
                            },
                        });

                        //extract the text response as web search context
                        mcpWebSearchContext = response.text ?? "";
                        console.log(`✅ MCP agentic flow complete using ${model}`);
                        console.log(`✅ Web search context: ${mcpWebSearchContext}`);

                        break; //success, exit retry loop
                    } catch (error) {
                        //handle rate limits (429) or other transient errors
                        const status = error instanceof Error && 'status' in error ? (error as { status: number }).status : undefined;

                        if (status === 429 || status === 503) {
                            console.log(`⚠️ Web search model ${model} rate limited/unavailable (${status}), trying next...`);
                            continue;
                        }
                        console.error(`❌ Web search error with ${model}:`, error);
                        //if it's a validation error (400) it might be the schema issue again, but likely just a model error
                        //we break here to avoid infinite loops on non-retriable errors, but could also continue
                        //for now, let's allow trying other models even on other errors just in case
                        continue;
                    }
                }
            } finally {
                //ensure connection is always closed
                await mcpClient.close();
                console.log(`🔒 MCP client connection closed`);
            }
        }
        ///==================== END OPTION B ====================///

        //Build final Context (Database search + Web search)
        //NOTE: change to webSearchContext if using OPTION A (API)
        const finalContext = `documentation context:${docsContext}\n\n web search context:${mcpWebSearchContext}\n\n `

        //Set Up Gemini Stream
        const systemPrompt = `
            You are the "Insight Engine," a helpful and precise technical assistant for the provided documentation and web search results.

            Your mission: Answer the user's question using ONLY the provided [Context] block.

            STRICT RULES:
            1. **Context Grounding**: If the answer is not contained within the [Context], you must explicitly state: "I'm sorry, but I don't have enough information in the current scope to answer your question." 
            2. **No Hallucinations**: Do not use outside knowledge or make up features that don't exist in the provided text.
            3. **Tone**: Be concise, professional, and use Markdown for code blocks or bolding.
            4. **Source Attribution**: If the metadata includes a "source" filename, mention it at the end of your answer (e.g., "Source: docs/routing/intro.mdx").
        `.trim();

        //stream response from gemini (using context)
        //model fallback chain - tries each model in order until one works
        const modelsToTry = [
            "gemini-3-flash-preview",                      // primary - latest and fastest (20 RPD)
            "gemini-2.5-flash",                            // secondary - stable fallback (20 RPD)
            "gemma-3-27b-it",                              // fallback - open weights, high limits (14k RPD)
        ];

        //response declared outside loop so it's accessible after loop ends
        let response;

        //loop through models until one succeeds (rate limit fallback pattern)
        for (const modelId of modelsToTry) {
            try {
                //gemma 3 (open weights model) does not support systemInstruction
                //gemma models require system prompt to be part of the user message
                if (modelId === "gemma-3-27b-it") {
                    response = await client.models.generateContentStream({
                        model: modelId,
                        contents: [
                            //combine system prompt + context + question into single user message
                            { role: 'user', parts: [{ text: `${systemPrompt}\n\nContext: ${finalContext}\n\nQuestion: ${lastMessage}` }] }
                        ],
                        config: {
                            temperature: 0.7, //controls randomness (0 = deterministic, 1 = creative)
                        }
                    });
                } else {
                    //gemini models support systemInstruction natively
                    response = await client.models.generateContentStream({
                        model: modelId,
                        contents: [
                            { role: 'user', parts: [{ text: `Context: ${finalContext}\n\nQuestion: ${lastMessage}` }] }
                        ],
                        config: {
                            systemInstruction: systemPrompt, //passed separately for gemini models
                            temperature: 0.7,
                        }
                    });
                }
                console.log(`✅ Using model: ${modelId}`);
                break; //success! exit the loop, no need to try other models
            } catch (error) {
                //only continue to next model if rate limited (429), otherwise throw
                const status = error instanceof Error && 'status' in error ? (error as { status: number }).status : undefined;
                if (status !== 429) throw error;
                console.log(`⚠️ Model ${modelId} rate limited, trying next...`);
                //loop continues to try next model in the array
            }
        }

        //safety check - if all models failed (all rate limited), throw error
        if (!response) {
            throw new Error("All models are rate limited. Please try again later.");
        }
        console.log("✅ Response from Gemini received");

        //stream the response to the frontend
        //ReadableStream creates a "pipe" that sends data chunk by chunk
        const streamResponse = new ReadableStream({
            //start() is called when the stream is first created
            async start(controller) {
                //encoder converts strings to bytes (required for streaming)
                const encoder = new TextEncoder();
                try {
                    //iterate through each chunk from gemini's stream
                    for await (const chunk of response) {
                        //extract the text content from the chunk
                        const chunkText = chunk.text
                        if (chunkText) {
                            //enqueue = push data into the stream (string -> bytes)
                            controller.enqueue(encoder.encode(chunkText))
                        }
                    }
                    //close the stream when all chunks are sent
                    controller.close();
                } catch (error) {
                    //if something goes wrong, signal error to the frontend
                    controller.error(error);
                }
            }
        })
        console.log("✅ Stream Response created");

        //Return the raw Response object
        return new Response(streamResponse, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Connection": "keep-alive",
                "Cache-Control": "no-cache, no-transform",
            },
        });

    }
    catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
