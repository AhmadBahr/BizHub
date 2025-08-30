import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionManagementService } from './session-management.service';

@Injectable()
export class SessionService {
  constructor(
    private readonly configService: ConfigService,
    private readonly sessionManagementService: SessionManagementService,
  ) {}

  getSessionConfig() {
    return {
      secret: this.configService.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: this.configService.get<boolean>('SESSION_COOKIE_SECURE', false),
        httpOnly: this.configService.get<boolean>('SESSION_COOKIE_HTTPONLY', true),
        maxAge: this.configService.get<number>('SESSION_COOKIE_MAX_AGE', 86400000), // 24 hours
      },
    };
  }

  async createSession(userId: string, sessionData: any): Promise<string> {
    return this.sessionManagementService.createSession(userId, sessionData);
  }

  async getSession(sessionId: string): Promise<any> {
    return this.sessionManagementService.getSession(sessionId);
  }

  async destroySession(sessionId: string): Promise<void> {
    return this.sessionManagementService.destroySession(sessionId);
  }

  // Additional convenience methods
  async updateSession(sessionId: string, data: any): Promise<void> {
    return this.sessionManagementService.updateSession(sessionId, data);
  }

  async getUserSessions(userId: string): Promise<any[]> {
    return this.sessionManagementService.getUserSessions(userId);
  }

  async destroyAllUserSessions(userId: string): Promise<void> {
    return this.sessionManagementService.destroyAllUserSessions(userId);
  }

  async extendSession(sessionId: string, hours: number = 24): Promise<void> {
    return this.sessionManagementService.extendSession(sessionId, hours);
  }

  async getSessionStats(): Promise<any> {
    return this.sessionManagementService.getSessionStats();
  }
}
