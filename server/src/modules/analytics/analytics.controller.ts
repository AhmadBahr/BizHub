import { Controller, Get, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('deals')
  async getDealAnalytics() {
    try {
      return await this.analyticsService.getDealAnalytics();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch deal analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('tasks')
  async getTaskAnalytics() {
    try {
      return await this.analyticsService.getTaskAnalytics();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch task analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('leads')
  async getLeadAnalytics() {
    try {
      return await this.analyticsService.getLeadAnalytics();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch lead analytics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('overview')
  async getAllAnalytics() {
    try {
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
    } catch (error) {
      throw new HttpException(
        'Failed to fetch analytics overview',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
