import { glob } from "glob"; // Utility for finding files matching a pattern
import fs from "fs/promises"; // built-in node module for file system operations
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; // LangChain text splitting utility

// Ingest script logic will go here

//Configuration
const FILE_PATH_PATTERN = "/docs/**/*.md";
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
    console.log(`Split into ${splitDocs.length} chunks`);

    //step 4: store the data in the database

}

main().catch((error) => {
    console.error("Error ingesting data:", error);
    process.exit(1);
});