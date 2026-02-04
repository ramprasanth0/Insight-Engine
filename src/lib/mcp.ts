//mcp.ts - model context protocol client setup for tavily web search via MCP

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

//tavily mcp server endpoint (server-sent events for streaming)
const TAVILY_MCP_URL = "https://mcp.tavily.com/sse";

//creates and connects an MCP client to tavily's web search server
export const getMCPClient = async () => {
    const tavilyApiKey = process.env.TAVILY_API_KEY;
    if (!tavilyApiKey) {
        throw new Error("TAVILY_API_KEY not set - required for MCP connection");
    }

    //tavily mcp remote server endpoint (api key goes in query param)
    const mcpUrl = `https://mcp.tavily.com/mcp/?tavilyApiKey=${tavilyApiKey}`;

    //create SSE transport for server-sent events communication
    const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));

    //create MCP client (client discovers available tools from server on connect)
    const client = new Client({
        name: "insight-engine-client",
        version: "1.0.0",
    });

    //establish connection to tavily MCP server
    await client.connect(transport);
    console.log("✅ MCP client connected to Tavily");
    return client;
}