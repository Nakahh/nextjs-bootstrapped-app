const WebSocket = require('ws');

class ChatService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map();

    this.wss.on('connection', (ws, req) => {
      const userId = this.getUserIdFromRequest(req);
      this.clients.set(ws, userId);

      ws.on('message', (message) => {
        this.broadcastMessage(userId, message);
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });
  }

  getUserIdFromRequest(req) {
    // Extract user ID from request headers or cookies (JWT token)
    // For now, return a placeholder or implement JWT verification
    return req.headers['sec-websocket-protocol'] || 'guest';
  }

  broadcastMessage(senderId, message) {
    const data = JSON.stringify({ senderId, message, timestamp: new Date() });
    this.clients.forEach((userId, client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }
}

module.exports = ChatService;
