import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

export class CustomSSETransport extends SSEServerTransport {
  constructor(app) {
    super(app);
    this.connections = new Map();
  }

  start(req, res) {
    const id = Date.now().toString();
    this.connections.set(id, { req, res });
    return id;
  }

  async handlePostMessage(req, res) {
    const message = req.body;
    const connectionId = req.headers['x-connection-id'];
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('No active SSE connection');
    }

    try {
      const result = await this.handleMessage(message);
      connection.res.write(`data: ${JSON.stringify(result)}\n\n`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error handling message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  stop(id) {
    this.connections.delete(id);
  }
} 