import { Controller, Get, UseGuards, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  @ApiOperation({ summary: 'Get comprehensive dashboard metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard metrics retrieved successfully' 
  })
  async getDashboardMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('sales-performance')
  @ApiOperation({ summary: 'Get sales performance data' })
  @ApiQuery({ 
    name: 'userId', 
    required: false, 
    description: 'Filter by specific user ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Sales performance data retrieved successfully' 
  })
  async getSalesPerformance(@Query('userId') userId?: string) {
    return this.dashboardService.getSalesPerformance(userId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Overview metrics retrieved successfully' 
  })
  async getOverview() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.overview;
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue metrics and trends' })
  @ApiResponse({ 
    status: 200, 
    description: 'Revenue metrics retrieved successfully' 
  })
  async getRevenueMetrics() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.revenue;
  }

  @Get('leads/sources')
  @ApiOperation({ summary: 'Get lead source statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead source statistics retrieved successfully' 
  })
  async getLeadSourceStats() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.leadSourceStats;
  }

  @Get('leads/status')
  @ApiOperation({ summary: 'Get lead status statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lead status statistics retrieved successfully' 
  })
  async getLeadStatusStats() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.leadStatusStats;
  }

  @Get('deals/status')
  @ApiOperation({ summary: 'Get deal status statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Deal status statistics retrieved successfully' 
  })
  async getDealStatusStats() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.dealStatusStats;
  }

  @Get('activities/recent')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent activities retrieved successfully' 
  })
  async getRecentActivities() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.recentActivities;
  }

  @Get('tasks/upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks' })
  @ApiResponse({ 
    status: 200, 
    description: 'Upcoming tasks retrieved successfully' 
  })
  async getUpcomingTasks() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.upcomingTasks;
  }

  @Get('top-deals')
  @ApiOperation({ summary: 'Get top deals' })
  @ApiResponse({ 
    status: 200, 
    description: 'Top deals retrieved successfully' 
  })
  async getTopDeals() {
    const metrics = await this.dashboardService.getDashboardMetrics();
    return metrics.topDeals;
  }
}
