import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtAuthService } from '@modules/auth/jwt-auth.service';
import { Scan } from '@database/entities/scan.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, this should be restricted
  },
  namespace: 'scans',
})
export class ScansGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ScansGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtAuthService: JwtAuthService) {}

  async handleConnection(socket: Socket) {
    try {
      const token = this.extractToken(socket);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (Socket: ${socket.id})`);
        socket.disconnect();
        return;
      }

      const payload = await this.jwtAuthService.validateAccessToken(token);
      socket.data.user = payload;
      const userId = payload.sub;

      await socket.join(`user:${userId}`);
      this.logger.log(`User ${userId} connected via WebSocket (Socket: ${socket.id})`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`WebSocket connection authentication failed: ${errorMessage}`);
      socket.disconnect();
    }
  }

  async handleDisconnect(socket: Socket) {
    const userId = socket.data.user?.sub;
    if (userId) {
      await socket.leave(`user:${userId}`);
      delete socket.data.user;
      this.logger.log(`User ${userId} disconnected from WebSocket (Socket: ${socket.id})`);
    } else {
      this.logger.log(`Unauthenticated client disconnected (Socket: ${socket.id})`);
    }
  }

  /**
   * Emits a scan:created event to the specific user's room
   */
  emitScanCreated(userId: string, scan: Scan) {
    this.server.to(`user:${userId}`).emit('scan:created', scan);
    this.logger.debug(`Emitted scan:created for user ${userId}`);
  }

  /**
   * Emits a scan:deleted event to the specific user's room
   */
  emitScanDeleted(userId: string, scanId: string) {
    this.server.to(`user:${userId}`).emit('scan:deleted', { id: scanId });
    this.logger.debug(`Emitted scan:deleted for user ${userId}`);
  }

  private extractToken(socket: Socket): string | undefined {
    // 1. Check handshake.auth
    if (socket.handshake.auth?.token) {
      return socket.handshake.auth.token;
    }

    // 2. Check handshake.query
    if (socket.handshake.query?.token) {
      return socket.handshake.query.token as string;
    }
    // 3. Check Authorization header
    const authHeader = socket.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return undefined;
  }
}
