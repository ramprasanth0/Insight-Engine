import { glob } from "glob"; // Utility for finding files matching a pattern
import fs from "fs/promises"; // built-in node module for file system operations
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // LangChain text splitting utility
import { GoogleGenAI } from "@google/genai";
import { Pinecone } from "@pinecone-database/pinecone";
import * as dotenv from 'dotenv';
dotenv.config({ path: ".env.local" });


// Ingest script logic will go here

//Configuration
const FILE_PATH_PATTERN = "docs/**/*.{mdx,md}";
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

async function main() {
    console.log('🚀 Ingestion started')

    //step 1: load the files
    const filepaths = await glob(FILE_PATH_PATTERN);
    console.log(`Found ${filepaths.length} files to ingest`);
    if (filepaths.length == 0) {
        console.error("❌ No files found! Did you create a 'docs' folder?");
        return;
    }


    //step 2: read the data from the docs folder and create "raw docs" object
    const rawDocs = []     //object to store the data from the files
    for (const filepath of filepaths) {
        console.log(`Reading file: ${filepath}`);
        const content = await fs.readFile(filepath, "utf-8");
        // We store the text AND the filename (metadata)
        rawDocs.push({
            metadata: { source: filepath },
            pageContent: content
        });
    }
    console.log(`✅ Loaded ${rawDocs.length} documents.`);


    //step 3: process the data (chunking, embedding)
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP
    })
    const splitDocs = await splitter.splitDocuments(rawDocs);
    console.log(`🔪 Split into ${splitDocs.length} chunks`);


    //step 4: create embeddings
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    type VectorDoc = {
        id: string;
        values: any;
        metadata: {
            text: string;
            source: string;
        }
    };
    const vectorDocs: VectorDoc[] = []
    const MODEL_NAME = "text-embedding-004";

    // Looping through splitDocs in chunks of 10
    for (let i = 0; i < splitDocs.length; i += 10) {
        const batch = splitDocs.slice(i, i + 10);
        console.log(`Processing batch ${i / 10 + 1}...`);

        // A. create and add 10 requests to run in parallel
        const batchPromises = batch.map(doc =>
            client.models.embedContent({
                model: MODEL_NAME,
                contents: doc.pageContent, // New SDK accepts string directly here
                config: {
                    taskType: 'RETRIEVAL_DOCUMENT',
                    title: doc.metadata.source // Optional: Helps the AI understand the context
                }
            })
        );

        // B. Run and wait for all 10 to finish
        // types: Array<EmbedContentResponse>
        const responses = await Promise.all(batchPromises);

        // 🔍 DEBUG: Print the raw structure of the first response
        if (i === 0) {
            console.log("📦 RAW API RESPONSE (First Item):");
            console.dir(responses[0], { depth: null }); // 'dir' prints deep objects
        }

        // C. Collect results
        responses.forEach((response, index) => {
            const vector = response.embeddings?.[0].values;

            if (vector) {
                vectorDocs.push({
                    id: `doc-${i + index}`,
                    values: vector,
                    metadata: {
                        text: batch[index].pageContent, // Match back to original text
                        source: batch[index].metadata.source
                    }
                });
            }
        });
    }
    console.log(`✅ Ready to upsert ${vectorDocs.length} vectors!`);


    //step 5: store the data in the database
    // const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY })
    // const index = pc.index("insightengine")


}

main().catch((error) => {
    console.error("Error ingesting data:", error);
    process.exit(1);
});