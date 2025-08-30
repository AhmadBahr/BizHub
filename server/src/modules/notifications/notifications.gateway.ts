import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Injectable } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
@Injectable()
@UseGuards(WsJwtGuard)
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('No token provided in connection attempt');
        client.disconnect();
        return;
      }

      // Verify token and get user
      const user = await this.verifyToken(token);
      if (!user) {
        console.log('Token verification failed');
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(user.id, client.id);
      client.data.userId = user.id;
      client.data.user = user;

      console.log(`User ${user.id} (${user.email}) connected successfully`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    const userEmail = client.data.user?.email;
    if (userId) {
      this.connectedUsers.delete(userId);
      console.log(`User ${userId}${userEmail ? ` (${userEmail})` : ''} disconnected`);
    }
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const user = client.data.user;
    
    if (userId && user) {
      client.join(`user:${userId}`);
      console.log(`User ${userId} (${user.email}) joined their room`);
    } else {
      console.log('Invalid user data for join attempt');
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = client.data.userId;
    const user = client.data.user;
    
    if (userId && user) {
      try {
        await this.notificationsService.markAsRead(data.notificationId, userId);
        console.log(`User ${userId} (${user.email}) marked notification ${data.notificationId} as read`);
      } catch (error) {
        console.error(`Failed to mark notification as read for user ${userId}:`, error);
      }
    } else {
      console.log('Invalid user data for markAsRead attempt');
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    const user = client.data.user;
    
    if (userId && user) {
      try {
        await this.notificationsService.markAllAsRead(userId);
        console.log(`User ${userId} (${user.email}) marked all notifications as read`);
      } catch (error) {
        console.error(`Failed to mark all notifications as read for user ${userId}:`, error);
      }
    } else {
      console.log('Invalid user data for markAllAsRead attempt');
    }
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      try {
        this.server.to(socketId).emit('notification', notification);
        console.log(`Notification sent to user ${userId}`);
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
      }
    } else {
      console.log(`User ${userId} is not currently connected`);
    }
  }

  // Method to send notification to all connected users
  async sendNotificationToAll(notification: any) {
    try {
      this.server.emit('notification', notification);
      console.log(`Notification sent to all ${this.connectedUsers.size} connected users`);
    } catch (error) {
      console.error('Failed to send notification to all users:', error);
    }
  }

  // Method to send notification to multiple users
  async sendNotificationToUsers(userIds: string[], notification: any) {
    const connectedUserIds = userIds.filter(userId => this.connectedUsers.has(userId));
    const disconnectedUserIds = userIds.filter(userId => !this.connectedUsers.has(userId));
    
    if (connectedUserIds.length > 0) {
      try {
        connectedUserIds.forEach(userId => {
          this.sendNotificationToUser(userId, notification);
        });
        console.log(`Notification sent to ${connectedUserIds.length} connected users`);
      } catch (error) {
        console.error('Failed to send notifications to multiple users:', error);
      }
    }
    
    if (disconnectedUserIds.length > 0) {
      console.log(`${disconnectedUserIds.length} users are not currently connected`);
    }
  }

  // Method to get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Method to get list of connected user IDs
  getConnectedUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      // Verify the JWT token using the JWT service
      const payload = this.jwtService.verify(token);
      
      // Extract user ID from the payload
      const userId = payload.sub;
      if (!userId) {
        return null;
      }

      // Fetch user details from the users service
      const user = await this.usersService.findById(userId);
      if (!user || !user.isActive) {
        return null;
      }

      // Return user information
      return {
        id: user.id,
        email: user.email,
        role: user.role?.name,
        permissions: user.role?.permissions,
      };
    } catch (error) {
      // Token is invalid, expired, or verification failed
      console.error('Token verification failed:', error);
      return null;
    }
  }
}
