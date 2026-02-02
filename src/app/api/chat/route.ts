export const dynamic = 'force-dynamic'; //force dynamic caching

import { gemini } from "@/lib/gemini";
import { pinecone } from "@/lib/pinecone";
import { tavily_api } from "@/lib/tavily";
import { error } from "console";
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
            throw (error)
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
        console.log(`✅ Searching namespace: ${targetNamespaces}`);


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

        let webSearchContext = "";
        if (webSearch) {
            //Get Tavily context (Web search context)
            const tavilyResponses = await tavily_api.search(
                lastMessage, {
                max_results: 5
            }
            )
            webSearchContext = tavilyResponses.results.map((res) => res.content).join("\n\n")

            console.log(`✅ Context built with ${tavilyResponses.results.length} matches - Tavily (Web search) context`);
        }

        //Build final Context (Database search + Web search)
        const finalContext = `documentation context:${docsContext}/n/n web search context:${webSearchContext}/n/n `

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
        const response = await client.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `Context: ${finalContext}\n\nQuestion: ${lastMessage}` }] }
            ],
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
            }
        })
        //stream the response to the frontend --> (Creating the Pipe (The ReadableStream))
        const streamResponse = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of response) {
                        // Get the text delta from the current chunk
                        const chunkText = chunk.text
                        if (chunkText) {
                            // Send the raw text chunk to the frontend(string into bytes)
                            controller.enqueue(encoder.encode(chunkText))
                        }
                    }
                    controller.close();    // Telling the browser we're done
                } catch (error) {
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
