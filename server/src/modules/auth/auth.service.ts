import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { TokenManagementService } from './token-management.service';
import { SessionManagementService } from './session/session-management.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { UserResponseDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tokenBlacklistService: TokenBlacklistService,
    private readonly tokenManagementService: TokenManagementService,
    private readonly sessionManagementService: SessionManagementService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByEmailForAuth(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(loginDto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name,
      permissions: user.role.permissions 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Create session
    const sessionId = await this.sessionManagementService.createSession(user.id, {
      userAgent,
      ipAddress,
    });

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      this.configService.get('BCRYPT_ROUNDS', 12),
    );

    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name,
      permissions: user.role.permissions 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role.name,
        permissions: user.role.permissions 
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.generateRefreshToken(newPayload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Generate and store reset token in separate table
    const resetToken = await this.tokenManagementService.createPasswordResetToken(user.id);

    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Verify and consume reset token from separate table
    const userId = await this.tokenManagementService.verifyPasswordResetToken(resetPasswordDto.token);

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      this.configService.get('BCRYPT_ROUNDS', 12),
    );

    // Update password
    await this.usersService.updatePassword(userId, hashedPassword);

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Verify and consume email verification token from separate table
    const userId = await this.tokenManagementService.verifyEmailVerificationToken(verifyEmailDto.token);

    // Mark email as verified
    await this.usersService.markEmailAsVerified(userId);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a verification link has been sent.' };
    }

    // Generate and store verification token in separate table
    const verificationToken = await this.tokenManagementService.createEmailVerificationToken(user.id);

    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return { message: 'If the email exists, a verification link has been sent.' };
  }

  /**
   * Logout user by blacklisting their current token and destroying session
   */
  async logout(token: string, userId: string, sessionId?: string): Promise<{ message: string }> {
    try {
      // Blacklist the current token
      await this.tokenBlacklistService.blacklistToken(token, userId);
      
      // Destroy session if sessionId is provided
      if (sessionId) {
        await this.sessionManagementService.destroySession(sessionId);
      }
      
      return { message: 'Logout successful. Token has been revoked and session destroyed.' };
    } catch (error) {
      console.error('Error during logout:', error);
      throw new UnauthorizedException('Logout failed');
    }
  }

  /**
   * Logout user from all devices
   */
  async logoutFromAllDevices(userId: string): Promise<{ message: string }> {
    try {
      // Destroy all user sessions
      await this.sessionManagementService.destroyAllUserSessions(userId);
      
      return { message: 'Logged out from all devices successfully.' };
    } catch (error) {
      console.error('Error during logout from all devices:', error);
      throw new UnauthorizedException('Logout from all devices failed');
    }
  }

  private generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }
}
