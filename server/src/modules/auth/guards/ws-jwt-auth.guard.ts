import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new WsException('Authentication token not found');
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      if (!userId) {
        throw new WsException('Invalid token payload');
      }

      // Attach user info to the socket
      client.handshake.auth.userId = userId;
      client.handshake.auth.user = payload;
      
      return true;
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
