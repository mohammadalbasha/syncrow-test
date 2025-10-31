import { Socket } from "socket.io";

export const extractTokenFromSocket = (client: Socket): string | null => {
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    if (client.handshake.query?.token) {
      return Array.isArray(client.handshake.query.token)
        ? client.handshake.query.token[0]
        : client.handshake.query.token;
    }

    
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
