import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from 'express';
import cors from 'cors';
import { registerTools } from './tools/index.js';
import { registerResources } from './resources/index.js';

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create an MCP server
const mcpServer = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

// Register tools and resources
registerTools(mcpServer);
registerResources(mcpServer);

// Set up MCP endpoint for direct requests
app.post('/mcp', (req, res) => {
  mcpServer.handleRequest(req, res);
});

// Set up SSE endpoint with improved connection handling
app.get('/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Create SSE transport for this connection
  const sseTransport = new SSEServerTransport(app);
  
  // Connect the transport
  mcpServer.connect(sseTransport).catch(error => {
    console.error('Error connecting SSE transport:', error);
    res.end();
  });

  // Send initial connection message
  res.write('event: connected\ndata: {}\n\n');

  // Handle client disconnect
  req.on('close', () => {
    console.log('Client disconnected');
  });
});

// Set up message endpoint with better error handling
app.post('/message', express.json(), async (req, res) => {
  try {
    const sseTransport = new SSEServerTransport(app);
    await mcpServer.connect(sseTransport);
    const result = await sseTransport.handlePostMessage(req, res);
    if (!res.headersSent) {
      res.json(result);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Start Express server
const startServer = async (port) => {
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(port);
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          reject(err);
        }
      });
      server.on('listening', resolve);
    });
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      await startServer(port + 1);
    } else {
      throw err;
    }
  }
};

// Start server and connect stdio transport
await startServer(3000);
const stdioTransport = new StdioServerTransport();
await mcpServer.connect(stdioTransport);

