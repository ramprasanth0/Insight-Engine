# 🧠 Insight Engine

**Insight Engine** is a high-performance RAG (Retrieval-Augmented Generation) application built to chat with documentation. It utilizes an "Offline Ingestion, Online Retrieval" architecture to provide accurate, context-aware answers while minimizing hallucinations.

---

## 🏗️ Architecture

The project is split into two distinct workflows to ensure modularity and scalability:

* **Ingestion Engine (Offline):** A robust Node.js pipeline that reads, chunks, and indexes data.
* **Query Engine (Online):** A Next.js API that retrieves context and generates answers in real-time.
* **Architecture Diagram**:

    ![Architecture Diagram](project%20info/Workflow.png)

---

## 🚀 Features

* **Smart Ingestion:** Uses glob for recursive file discovery across your documentation folders.
* **Context-Aware Splitting:** Utilizes LangChain recursive splitters to keep related text segments together.
* **Parallel Processing & Throttling:** Implements a custom "Batch & Throttle" system to respect Gemini Free Tier limits (100 RPM) while maintaining high ingestion speed.
* **Semantic Search:** Employs Pinecone namespaces and Cosine Similarity to find the most relevant documentation chunks.
* **Type Safety:** Fully typed with TypeScript (Strict Mode) to eliminate runtime errors and improve developer experience.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Embeddings** | Gemini `text-embedding-004` (768 dimensions) |
| **LLM** | Gemini 2.0-flash (Streaming) |
| **Vector DB** | Pinecone (Serverless) |
| **Utilities** | `dotenv`, `glob`, `@langchain/textsplitters` |

---

## ⚙️ Setup & Installation

### 1. Clone & Install
```bash
git clone [https://github.com/your-username/insight-engine.git](https://github.com/your-username/insight-engine.git)
cd insight-engine
npm install

2.  **Environment Secrets**
    Create a `.env.local` file in the root:
    ```bash
    # Google AI Studio (Gemini)
    GEMINI_API_KEY=BIzaSy...

    # Pinecone Vector DB
    PINECONE_API_KEY=lcvk_...
    ```

3.  **Prepare Data**
    Place your `.md` or `.mdx` files inside a `docs/` folder at the root.
```

---

## 🏃‍♂️ How to Run Ingestion

The Ingestion Engine is a standalone script that hydrates your vector database.It includes built-in rate-limiting logic to stay within the Gemini free tier quotas.
```bash 
npx tsx scripts/ingest.ts 
```
Key Ingestion Steps:
* **Discover**: Locate files using recursive globbing.
* **Chunk**: Split documents into $1000$-character segments with $200$-character overlap.
* **Embed**: Convert text to $768$-dimensional vectors via Gemini.
* **Upsert**: Store vectors in the nextjs-docs namespace in Pinecone.

* **Ingestion Workflow Diagram**:

    ![Architecture Diagram](project%20info/Ingestion%20Engine.png)

---

## 💬 Query & Chat Logic
When a user asks a question, the application follows a strict **grounded retrieval process**:
1. Query Vectorization: The user's input is embedded using the same text-embedding-004 model.
2. Namespace Search: The engine queries the nextjs-docs namespace in Pinecone.
3. Prompt Grounding: Relevant chunks are injected into a System Prompt that instructs the AI to only answer based on the provided context.
4. Streaming: The response is piped back to the user via a ReadableStream for a real-time chat experience.
*    Note: This architecture ensures that if the information isn't in your documentation, the AI won't make it up, effectively eliminating hallucinations.

* **RAG Pipleine Overview**:

    ![Architecture Diagram](project%20info/rag-pipeline.png)
