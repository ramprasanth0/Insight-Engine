import { gemini } from "@/lib/gemini";
import { pinecone } from "@/lib/pinecone";
import { error } from "console";
import { NextResponse } from "next/server";

//get user request

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1].content;

        console.log(`✅ User Query received: "${lastMessage}"`);

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

        //search pinecone
        const queryResponse = await pc.index("insight-engine-index").namespace("nextjs-docs").query({
            topK: 10,
            vector: queryVector,
            includeMetadata: true
        })
        // console.log("✅ Query Response received", queryResponse);
        console.log("✅ Query Response received");

        //build context from the search result
        const context = queryResponse.matches?.
            map((match) => match.metadata?.text).
            filter(Boolean).join("\n\n");                //filter is used to "Keep only the items that actually have content. Throw away the trash."
        // console.log("✅ Context built", context);
        console.log("✅ Context built");

        //Set Up Gemini Stream
        const systemPrompt = `
            You are the "Insight Engine," a helpful and precise technical assistant for the Next.js documentation.

            Your mission: Answer the user's question using ONLY the provided [Context] block.

            STRICT RULES:
            1. **Context Grounding**: If the answer is not contained within the [Context], you must explicitly state: "I'm sorry, but I don't have enough information in the current documentation to answer that." 
            2. **No Hallucinations**: Do not use outside knowledge or make up features that don't exist in the provided text.
            3. **Tone**: Be concise, professional, and use Markdown for code blocks or bolding.
            4. **Source Attribution**: If the metadata includes a "source" filename, mention it at the end of your answer (e.g., "Source: docs/routing/intro.mdx").
        `.trim();
        //stream response from gemini (using context)
        const response = await client.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: `Context: ${context}\n\nQuestion: ${lastMessage}` }] }
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
