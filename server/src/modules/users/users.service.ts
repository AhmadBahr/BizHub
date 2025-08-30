import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, UserResponseDto } from './dto/user.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';
import { TokenManagementService } from '../auth/token-management.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenManagementService: TokenManagementService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Verify role exists
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const user = await this.prisma.user.create({
      data: createUserDto,
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(query: UserQueryDto): Promise<PaginationResponseDto> {
    const { page = 1, limit = 10, search, roleId, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPassword,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }



  async findByEmailForAuth(email: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user; // Return with password for authentication
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If updating role, verify it exists
    if (updateUserDto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: {
        role: true,
      },
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateResetToken(id: string, resetToken: string): Promise<void> {
    // This method is now deprecated - tokens are stored in separate tables
    // Use TokenManagementService.createPasswordResetToken() instead
    console.warn('updateResetToken is deprecated. Use TokenManagementService.createPasswordResetToken() instead');
  }

  async findByResetToken(token: string): Promise<any> {
    try {
      // Verify the JWT token and find the user using TokenManagementService
      const userId = await this.tokenManagementService.verifyPasswordResetToken(token);
      
      if (userId) {
        // Find the user by ID
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { role: true },
        });
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by reset token:', error);
      return null;
    }
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { 
        password: hashedPassword,
        // Reset tokens are automatically cleared when used via TokenManagementService
      },
    });
  }

  async updateVerificationToken(id: string, verificationToken: string): Promise<void> {
    // This method is now deprecated - tokens are stored in separate tables
    // Use TokenManagementService.createEmailVerificationToken() instead
    console.warn('updateVerificationToken is deprecated. Use TokenManagementService.createEmailVerificationToken() instead');
  }

  async findByVerificationToken(token: string): Promise<any> {
    try {
      // Verify the JWT token and find the user using TokenManagementService
      const userId = await this.tokenManagementService.verifyEmailVerificationToken(token);
      
      if (userId) {
        // Find the user by ID
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          include: { role: true },
        });
        
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by verification token:', error);
      return null;
    }
  }

  async markEmailAsVerified(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { 
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });
  }

  /**
   * Create a password reset token for a user
   */
  async createPasswordResetToken(userId: string): Promise<string> {
    return this.tokenManagementService.createPasswordResetToken(userId);
  }

  /**
   * Create an email verification token for a user
   */
  async createEmailVerificationToken(userId: string): Promise<string> {
    return this.tokenManagementService.createEmailVerificationToken(userId);
  }

  /**
   * Verify and consume a password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<string> {
    return this.tokenManagementService.verifyPasswordResetToken(token);
  }

  /**
   * Verify and consume an email verification token
   */
  async verifyEmailVerificationToken(token: string): Promise<string> {
    return this.tokenManagementService.verifyEmailVerificationToken(token);
  }

  /**
   * Get token statistics for a user
   */
  async getUserTokenStats(userId: string) {
    return this.tokenManagementService.getUserTokenStats(userId);
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });
    
    return user?.emailVerified || false;
  }

  /**
   * Get user's email verification status
   */
  async getEmailVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { 
        emailVerified: true,
        emailVerifiedAt: true,
      },
    });
    
    return {
      emailVerified: user?.emailVerified || false,
      emailVerifiedAt: user?.emailVerifiedAt,
    };
  }
}
