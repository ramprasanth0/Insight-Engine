# 🧠 Insight Engine

A high-performance **RAG (Retrieval-Augmented Generation)** application built to chat with documentation. It uses an "Offline Ingestion, Online Retrieval" architecture to provide accurate, context-aware answers.

![Tech Stack](https://img.shields.io/badge/Stack-Next.js_15_|_TypeScript_|_Gemini_2.0_|_Pinecone-blue)

## 🏗️ Architecture

The project is split into two distinct workflows:
1.  **Ingestion Engine (Offline):** A robust Node.js pipeline that reads, chunks, and indexes data.
2.  **Query Engine (Online):** (Coming Soon) A Next.js API that retrieves context and generates answers.

## 🚀 Features

* **Smart Ingestion:** Uses `glob` for recursive file discovery.
* **Context-Aware Splitting:** Utilizes `LangChain` recursive splitters to keep related text together.
* **Parallel Processing:** Implements concurrent API requests to handle thousands of vectors in seconds.
* **Batching Logic:** Custom "Batch & Throttle" system to respect Gemini/Pinecone rate limits.
* **Type Safety:** Fully typed with TypeScript (Strict Mode).

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router)
* **Language:** TypeScript
* **AI Model:** Gemini `text-embedding-004` (via `@google/genai`)
* **Vector DB:** Pinecone (Serverless)
* **Utilities:** `dotenv`, `glob`, `@langchain/textsplitters`

## ⚙️ Setup & Installation

1.  **Clone & Install**
    ```bash
    npm install
    ```

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

## 🏃‍♂️ How to Run Ingestion

We use a standalone script to hydrate the database. It does not run in the browser.

```bash
npx tsx scripts/ingest.ts
