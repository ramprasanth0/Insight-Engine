# Changelog

All notable changes to Insight Engine will be documented in this file.

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
