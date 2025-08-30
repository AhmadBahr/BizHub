import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

export interface SessionData {
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  loginTime: Date;
  lastActivity: Date;
  [key: string]: any;
}

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new session for a user
   */
  async createSession(userId: string, sessionData: Partial<SessionData> = {}): Promise<string> {
    try {
      // Generate a unique session ID
      const sessionId = this.generateSessionId();
      
      // Set session expiration (default: 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.configService.get<number>('SESSION_DURATION_HOURS', 24));

      // Prepare session data
      const data: SessionData = {
        userId,
        loginTime: new Date(),
        lastActivity: new Date(),
        ...sessionData,
      };

      // Store session in database
      await this.prisma.userSession.create({
        data: {
          sessionId,
          userId,
          data,
          expiresAt,
        },
      });

      this.logger.log(`Session created for user ${userId} with ID ${sessionId}`);
      return sessionId;
    } catch (error) {
      this.logger.error(`Error creating session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve session data from database
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId },
        include: { user: true },
      });

      if (!session) {
        return null;
      }

      // Check if session has expired
      if (session.expiresAt < new Date()) {
        this.logger.log(`Session ${sessionId} has expired, removing from database`);
        await this.destroySession(sessionId);
        return null;
      }

      // Update last activity
      await this.updateLastActivity(sessionId);

      // Return session data
      return session.data as SessionData;
    } catch (error) {
      this.logger.error(`Error retrieving session ${sessionId}:`, error);
      return null;
    }
  }

  /**
   * Update session data
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<void> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      // Merge existing data with new data
      const updatedData = {
        ...(session.data as Record<string, any>),
        ...data,
        lastActivity: new Date(),
      };

      await this.prisma.userSession.update({
        where: { sessionId },
        data: {
          data: updatedData,
          lastActivity: new Date(),
        },
      });

      this.logger.log(`Session ${sessionId} updated successfully`);
    } catch (error) {
      this.logger.error(`Error updating session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Update session last activity timestamp
   */
  async updateLastActivity(sessionId: string): Promise<void> {
    try {
      await this.prisma.userSession.update({
        where: { sessionId },
        data: {
          lastActivity: new Date(),
          data: {
            update: {
              lastActivity: new Date(),
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error updating last activity for session ${sessionId}:`, error);
    }
  }

  /**
   * Destroy/remove session from database
   */
  async destroySession(sessionId: string): Promise<void> {
    try {
      await this.prisma.userSession.delete({
        where: { sessionId },
      });

      this.logger.log(`Session ${sessionId} destroyed successfully`);
    } catch (error) {
      this.logger.error(`Error destroying session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<Array<{
    sessionId: string;
    data: SessionData;
    expiresAt: Date;
    lastActivity: Date;
    createdAt: Date;
  }>> {
    try {
      const sessions = await this.prisma.userSession.findMany({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          lastActivity: 'desc',
        },
      });

      return sessions.map(session => ({
        sessionId: session.sessionId,
        data: session.data as SessionData,
        expiresAt: session.expiresAt,
        lastActivity: session.lastActivity,
        createdAt: session.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting sessions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Destroy all sessions for a user (useful for logout from all devices)
   */
  async destroyAllUserSessions(userId: string): Promise<void> {
    try {
      const deletedCount = await this.prisma.userSession.deleteMany({
        where: { userId },
      });

      this.logger.log(`Destroyed ${deletedCount.count} sessions for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error destroying all sessions for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      const deletedCount = await this.prisma.userSession.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (deletedCount.count > 0) {
        this.logger.log(`Cleaned up ${deletedCount.count} expired sessions`);
      }
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions:', error);
    }
  }

  /**
   * Extend session expiration
   */
  async extendSession(sessionId: string, hours: number = 24): Promise<void> {
    try {
      const session = await this.prisma.userSession.findUnique({
        where: { sessionId },
      });

      if (!session) {
        throw new UnauthorizedException('Session not found');
      }

      const newExpiresAt = new Date();
      newExpiresAt.setHours(newExpiresAt.getHours() + hours);

      await this.prisma.userSession.update({
        where: { sessionId },
        data: {
          expiresAt: newExpiresAt,
          lastActivity: new Date(),
        },
      });

      this.logger.log(`Session ${sessionId} extended by ${hours} hours`);
    } catch (error) {
      this.logger.error(`Error extending session ${sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  }> {
    try {
      const [totalSessions, activeSessions, expiredSessions] = await Promise.all([
        this.prisma.userSession.count(),
        this.prisma.userSession.count({
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
        }),
        this.prisma.userSession.count({
          where: {
            expiresAt: {
              lt: new Date(),
            },
          },
        }),
      ]);

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
      };
    } catch (error) {
      this.logger.error('Error getting session stats:', error);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
      };
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `sess_${randomBytes(32).toString('hex')}`;
  }
}
