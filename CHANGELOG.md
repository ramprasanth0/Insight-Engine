# Changelog

All notable changes to Insight Engine will be documented in this file.

## [0.3.0] - 2026-02-04

### 🚀 Major Improvements

- **Full Agentic Flow** - Upgraded from manual tool calling to Google GenAI's `mcpToTool` integration.
  - Gemini now autonomously decides when to search the web based on conversation context.
  - Eliminated manual tool parsing logic for better reliability.

- **Robust Retry Logic** - Added intelligent error handling for the agentic loop.
  - Automatically retries on `429 Rate Limit` errors.
  - Fallback chain: `gemini-3-flash-preview` → `gemini-2.5-flash` → `gemini-2.0-flash`.
  - Ensures high availability even under load.

### 📚 Documentation

- **Architecture Diagram** - Added MermaidJS flow diagram illustrating the Hybrid Agentic Architecture.
- **Tech Stack** - Updated with `@modelcontextprotocol/sdk` and Agentic capabilities.
- **Demo** - Updated review video with latest agentic behavior.

---

## [0.2.0] - 2026-02-04

### ✨ New Features

- **MCP Integration** - Added Model Context Protocol support for Tavily web search
  - Connect to Tavily's remote MCP server for standardized tool calling
  - Discover and use 5 tools: `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`
  - Swappable API/MCP implementations via OPTION A/B code blocks in `route.ts`

- **File Overview Comments** - Added file overview comments to all custom source files
  - Format: `//filename.ts - brief description`
  - Improves code navigation and maintainability

### 🛠️ Technical Changes

- Added `lib/mcp.ts` - MCP client setup using `StreamableHTTPClientTransport`
- Added `getGeminiModels()` helper in `lib/gemini.ts`
- Updated `route.ts` with swappable web search implementations

### 📦 Dependencies

- `@modelcontextprotocol/sdk`: ^1.25.3

---

## [0.1.0] - Initial Release

- Next.js 16 + React 19 chat interface
- Pinecone vector search for Next.js and React.js docs
- Gemini AI for response generation with streaming
- Tavily API for web search
- Dark/light theme toggle
- Namespace filtering (Next.js, React.js docs)
