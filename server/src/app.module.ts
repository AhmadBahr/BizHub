import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { LeadsModule } from './modules/leads/leads.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { ExportModule } from './modules/export/export.module';
import { BulkOperationsModule } from './modules/bulk-operations/bulk-operations.module';
import { PdfModule } from './modules/pdf/pdf.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        ttl: 3600000, // 1 hour
        limit: 1000, // 1000 requests per hour
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ContactsModule,
    LeadsModule,
    DealsModule,
    TasksModule,
    ActivitiesModule,
    DashboardModule,
    AnalyticsModule,
    NotificationsModule,
    FilesModule,
    ExportModule,
    BulkOperationsModule,
    PdfModule,
    IntegrationsModule,
  ],
})
export class AppModule {}
