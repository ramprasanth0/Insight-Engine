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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined in the environment variables");
    }
    const client = new GoogleGenAI({ apiKey });
    type VectorDoc = {
        id: string;
        values: number[];
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
                contents: doc.pageContent,
                config: {
                    taskType: 'RETRIEVAL_DOCUMENT',
                    title: doc.metadata.source // Helps the AI understand the context
                }
            })
        );

        // B. Run and wait for all 10 to finish
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
    //configure DB
    const pineconeApiKey = process.env.PINECONE_API_KEY;
    if (!pineconeApiKey) {
        throw new Error("PINECONE_API_KEY is not defined in the environment variables");
    }
    const pc = new Pinecone({ apiKey: pineconeApiKey });

    //configure index
    const INDEX_NAME = "insight-engine-index";
    const index = pc.index(INDEX_NAME);
    const existingIndexes = pc.listIndexes();
    const indexExists = (await existingIndexes).indexes?.some(idx => idx.name === INDEX_NAME)

    if (!indexExists) {
        console.log(`Creating index ${INDEX_NAME}...`)
        await pc.createIndex({
            name: INDEX_NAME,
            dimension: 768,
            metric: "cosine",
            spec: {
                serverless: { cloud: 'aws', region: 'us-east-1' }
            }
        })
    }

    // Wait for initialization
    console.log("⏳ Waiting for index to initialize...");
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Upsert data (nextjs-docs namespace,reactjs-docs namespace)
    const UPSERT_BATCH_SIZE = 100;
    for (let i = 0; i < vectorDocs.length; i += UPSERT_BATCH_SIZE) {
        const batch = vectorDocs.slice(i, i + UPSERT_BATCH_SIZE);
        console.log(`Upserting batch ${i / UPSERT_BATCH_SIZE + 1}...`);
        await index.namespace("reactjs-docs").upsert(batch)
    }
    console.log(`✅ Upserted ${vectorDocs.length} vectors!`);

    console.log("🎉 Ingestion complete!");
}

main().catch((error) => {
    console.error("Error ingesting data:", error);
    process.exit(1);
});