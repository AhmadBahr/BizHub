import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto';
import { UserResponseDto } from '../users/dto/user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role.name,
      permissions: user.role.permissions 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      accessToken,
      refreshToken,
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

    // Generate reset token
    const resetToken = this.generateResetToken(user.id);
    
    // Store reset token in user record (in a real app, you'd store this in a separate table)
    await this.usersService.updateResetToken(user.id, resetToken);

    // TODO: Send email with reset link
    // In a real application, you would send an email here
    console.log(`Password reset token for ${user.email}: ${resetToken}`);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    // Verify reset token
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      resetPasswordDto.newPassword,
      this.configService.get('BCRYPT_ROUNDS', 12),
    );

    // Update password and clear reset token
    await this.usersService.updatePassword(user.id, hashedPassword);

    return { message: 'Password has been reset successfully' };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    // Verify email verification token
    const user = await this.usersService.findByVerificationToken(verifyEmailDto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Mark email as verified
    await this.usersService.markEmailAsVerified(user.id);

    return { message: 'Email verified successfully' };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a verification link has been sent.' };
    }

    // Generate verification token
    const verificationToken = this.generateVerificationToken(user.id);
    
    // Store verification token
    await this.usersService.updateVerificationToken(user.id, verificationToken);

    // TODO: Send email with verification link
    // In a real application, you would send an email here
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    return { message: 'If the email exists, a verification link has been sent.' };
  }

  private generateRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  private generateResetToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'password_reset' },
      { expiresIn: '1h' }
    );
  }

  private generateVerificationToken(userId: string): string {
    return this.jwtService.sign(
      { sub: userId, type: 'email_verification' },
      { expiresIn: '24h' }
    );
  }
}
