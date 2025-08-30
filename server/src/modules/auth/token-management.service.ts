import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a password reset token
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    try {
      // Invalidate any existing reset tokens for this user
      await this.prisma.passwordResetToken.updateMany({
        where: { userId, used: false },
        data: { used: true },
      });

      // Generate new token
      const token = this.jwtService.sign(
        { sub: userId, type: 'password_reset' },
        { expiresIn: '1h' }
      );

      // Decode to get expiration
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Store in database
      await this.prisma.passwordResetToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });

      console.log(`Password reset token created for user ${userId}`);
      return token;
    } catch (error) {
      console.error('Error creating password reset token:', error);
      throw error;
    }
  }

  /**
   * Verify and consume a password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string> {
    try {
      // Find the token in database
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken) {
        throw new BadRequestException('Invalid reset token');
      }

      if (resetToken.used) {
        throw new BadRequestException('Reset token has already been used');
      }

      if (resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Reset token has expired');
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'password_reset') {
        throw new BadRequestException('Invalid token type');
      }

      // Mark token as used
      await this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      });

      console.log(`Password reset token verified for user ${resetToken.userId}`);
      return resetToken.userId;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error verifying password reset token:', error);
      throw new BadRequestException('Invalid reset token');
    }
  }

  /**
   * Create an email verification token
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    try {
      // Invalidate any existing verification tokens for this user
      await this.prisma.emailVerificationToken.updateMany({
        where: { userId, used: false },
        data: { used: true },
      });

      // Generate new token
      const token = this.jwtService.sign(
        { sub: userId, type: 'email_verification' },
        { expiresIn: '24h' }
      );

      // Decode to get expiration
      const decoded = this.jwtService.decode(token) as any;
      const expiresAt = new Date(decoded.exp * 1000);

      // Store in database
      await this.prisma.emailVerificationToken.create({
        data: {
          token,
          userId,
          expiresAt,
        },
      });

      console.log(`Email verification token created for user ${userId}`);
      return token;
    } catch (error) {
      console.error('Error creating email verification token:', error);
      throw error;
    }
  }

  /**
   * Verify and consume an email verification token
   */
  async verifyEmailVerificationToken(token: string): Promise<string> {
    try {
      // Find the token in database
      const verificationToken = await this.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verificationToken) {
        throw new BadRequestException('Invalid verification token');
      }

      if (verificationToken.used) {
        throw new BadRequestException('Verification token has already been used');
      }

      if (verificationToken.expiresAt < new Date()) {
        throw new BadRequestException('Verification token has expired');
      }

      // Verify JWT
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'email_verification') {
        throw new BadRequestException('Invalid token type');
      }

      // Mark token as used
      await this.prisma.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { used: true },
      });

      console.log(`Email verification token verified for user ${verificationToken.userId}`);
      return verificationToken.userId;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error verifying email verification token:', error);
      throw new BadRequestException('Invalid verification token');
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      // Clean up expired password reset tokens
      const deletedResetTokens = await this.prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      // Clean up expired email verification tokens
      const deletedVerificationTokens = await this.prisma.emailVerificationToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (deletedResetTokens.count > 0 || deletedVerificationTokens.count > 0) {
        console.log(`Cleaned up ${deletedResetTokens.count} expired password reset tokens and ${deletedVerificationTokens.count} expired email verification tokens`);
      }
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Get token statistics for a user
   */
  async getUserTokenStats(userId: string): Promise<{
    activeResetTokens: number;
    activeVerificationTokens: number;
    totalResetTokens: number;
    totalVerificationTokens: number;
  }> {
    try {
      const [activeResetTokens, activeVerificationTokens, totalResetTokens, totalVerificationTokens] = await Promise.all([
        this.prisma.passwordResetToken.count({
          where: { userId, used: false, expiresAt: { gt: new Date() } },
        }),
        this.prisma.emailVerificationToken.count({
          where: { userId, used: false, expiresAt: { gt: new Date() } },
        }),
        this.prisma.passwordResetToken.count({
          where: { userId },
        }),
        this.prisma.emailVerificationToken.count({
          where: { userId },
        }),
      ]);

      return {
        activeResetTokens,
        activeVerificationTokens,
        totalResetTokens,
        totalVerificationTokens,
      };
    } catch (error) {
      console.error('Error getting user token stats:', error);
      return {
        activeResetTokens: 0,
        activeVerificationTokens: 0,
        totalResetTokens: 0,
        totalVerificationTokens: 0,
      };
    }
  }
}
