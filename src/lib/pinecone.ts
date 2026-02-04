//pinecone.ts - pinecone vector database client setup for semantic search

import { Pinecone } from "@pinecone-database/pinecone";

const pineconeApiKey = process.env.PINECONE_API_KEY;

export const pinecone = pineconeApiKey
    ? new Pinecone({ apiKey: pineconeApiKey })
    : null as unknown as Pinecone;