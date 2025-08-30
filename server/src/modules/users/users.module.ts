import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TokenManagementService } from '../auth/token-management.service';

@Module({
  imports: [PrismaModule, JwtModule, ConfigModule],
  controllers: [UsersController],
  providers: [UsersService, TokenManagementService],
  exports: [UsersService],
})
export class UsersModule {}
