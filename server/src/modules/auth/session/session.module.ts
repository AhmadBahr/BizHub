import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionService } from './session.service';
import { SessionManagementService } from './session-management.service';
import { SessionCleanupService } from './session-cleanup.service';
import { SessionController } from './session.controller';
import { PrismaModule } from '../../../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [SessionController],
  providers: [SessionService, SessionManagementService, SessionCleanupService],
  exports: [SessionService, SessionManagementService],
})
export class SessionModule {}
