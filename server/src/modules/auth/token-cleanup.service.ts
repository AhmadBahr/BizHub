import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenManagementService } from './token-management.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly tokenManagementService: TokenManagementService,
  ) {}

  /**
   * Clean up expired tokens every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleTokenCleanup() {
    this.logger.log('Starting scheduled cleanup of expired tokens...');
    
    try {
      // Clean up blacklisted tokens
      await this.tokenBlacklistService.cleanupExpiredTokens();
      
      // Clean up password reset and email verification tokens
      await this.tokenManagementService.cleanupExpiredTokens();
      
      this.logger.log('Token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during token cleanup:', error);
    }
  }

  /**
   * Clean up expired tokens on demand (useful for testing or manual cleanup)
   */
  async manualCleanup(): Promise<void> {
    this.logger.log('Starting manual cleanup of expired tokens...');
    
    try {
      // Clean up blacklisted tokens
      await this.tokenBlacklistService.cleanupExpiredTokens();
      
      // Clean up password reset and email verification tokens
      await this.tokenManagementService.cleanupExpiredTokens();
      
      this.logger.log('Manual token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during manual token cleanup:', error);
      throw error;
    }
  }
}
