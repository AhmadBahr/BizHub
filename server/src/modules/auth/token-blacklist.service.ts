import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenBlacklistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Blacklist a token by storing it in the database
   */
  async blacklistToken(token: string, userId: string): Promise<void> {
    try {
      // Decode the token to get expiration
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Store the blacklisted token
      await this.prisma.blacklistedToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });

      console.log(`Token blacklisted for user ${userId}`);
    } catch (error) {
      console.error('Error blacklisting token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });

      return !!blacklistedToken;
    } catch (error) {
      console.error('Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Clean up expired blacklisted tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const deletedCount = await this.prisma.blacklistedToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (deletedCount.count > 0) {
        console.log(`Cleaned up ${deletedCount.count} expired blacklisted tokens`);
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Get all blacklisted tokens for a user
   */
  async getUserBlacklistedTokens(userId: string): Promise<string[]> {
    try {
      const tokens = await this.prisma.blacklistedToken.findMany({
        where: { userId },
        select: { token: true },
      });

      return tokens.map(t => t.token);
    } catch (error) {
      console.error('Error getting user blacklisted tokens:', error);
      return [];
    }
  }

  /**
   * Remove a specific token from blacklist (useful for admin operations)
   */
  async removeFromBlacklist(token: string): Promise<void> {
    try {
      await this.prisma.blacklistedToken.delete({
        where: { token },
      });

      console.log('Token removed from blacklist');
    } catch (error) {
      console.error('Error removing token from blacklist:', error);
      throw error;
    }
  }
}
