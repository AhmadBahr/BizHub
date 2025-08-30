import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionManagementService } from './session-management.service';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly sessionManagementService: SessionManagementService) {}

  /**
   * Clean up expired sessions every 30 minutes
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleSessionCleanup() {
    this.logger.log('Starting scheduled cleanup of expired sessions...');
    
    try {
      await this.sessionManagementService.cleanupExpiredSessions();
      this.logger.log('Session cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during session cleanup:', error);
    }
  }

  /**
   * Clean up expired sessions on demand (useful for testing or manual cleanup)
   */
  async manualCleanup(): Promise<void> {
    this.logger.log('Starting manual cleanup of expired sessions...');
    
    try {
      await this.sessionManagementService.cleanupExpiredSessions();
      this.logger.log('Manual session cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during manual session cleanup:', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<any> {
    try {
      const stats = await this.sessionManagementService.getSessionStats();
      this.logger.log(`Session stats: ${JSON.stringify(stats)}`);
      return stats;
    } catch (error) {
      this.logger.error('Error getting session stats:', error);
      throw error;
    }
  }
}
