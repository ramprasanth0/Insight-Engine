import { Pinecone } from "@pinecone-database/pinecone";

const pineconeApiKey = process.env.PINECONE_API_KEY;
if (!pineconeApiKey) {
    throw new Error("PINECONE_API_KEY is not defined in the environment variables");
}
export const pinecone = new Pinecone({ apiKey: pineconeApiKey });