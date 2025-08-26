import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('deals')
  async getDealAnalytics() {
    return this.analyticsService.getDealAnalytics();
  }

  @Get('tasks')
  async getTaskAnalytics() {
    return this.analyticsService.getTaskAnalytics();
  }

  @Get('leads')
  async getLeadAnalytics() {
    return this.analyticsService.getLeadAnalytics();
  }

  @Get('overview')
  async getAllAnalytics() {
    const [dealAnalytics, taskAnalytics, leadAnalytics] = await Promise.all([
      this.analyticsService.getDealAnalytics(),
      this.analyticsService.getTaskAnalytics(),
      this.analyticsService.getLeadAnalytics(),
    ]);

    return {
      deals: dealAnalytics,
      tasks: taskAnalytics,
      leads: leadAnalytics,
      timestamp: new Date().toISOString(),
    };
  }
}
