import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Activity, ActivityType } from '@prisma/client';

@ApiTags('activities')
@Controller('activities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activitiesService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Activities retrieved successfully' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: ActivityType,
    @Query('userId') userId?: string,
    @Query('leadId') leadId?: string,
    @Query('dealId') dealId?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.activitiesService.findAll({
      page: pageNum,
      limit: limitNum,
      type,
      userId,
      leadId,
      dealId,
      search,
    });
  }

  @Get('my-activities')
  @ApiOperation({ summary: 'Get activities for the current user' })
  @ApiResponse({ status: 200, description: 'User activities retrieved successfully' })
  async getMyActivities() {
    // TODO: Get current user ID from JWT token
    const currentUserId = 'current-user-id'; // This should come from the JWT token
    return this.activitiesService.getActivitiesByUser(currentUserId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming activities' })
  @ApiResponse({ status: 200, description: 'Upcoming activities retrieved successfully' })
  async getUpcomingActivities() {
    return this.activitiesService.getUpcomingActivities();
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get activities for a specific lead' })
  @ApiResponse({ status: 200, description: 'Lead activities retrieved successfully' })
  async getActivitiesByLead(@Param('leadId') leadId: string) {
    return this.activitiesService.getActivitiesByLead(leadId);
  }

  @Get('deal/:dealId')
  @ApiOperation({ summary: 'Get activities for a specific deal' })
  @ApiResponse({ status: 200, description: 'Deal activities retrieved successfully' })
  async getActivitiesByDeal(@Param('dealId') dealId: string) {
    return this.activitiesService.getActivitiesByDeal(dealId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark activity as completed' })
  @ApiResponse({ status: 200, description: 'Activity marked as completed' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async markAsCompleted(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.markAsCompleted(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an activity' })
  @ApiResponse({ status: 204, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.activitiesService.remove(id);
  }
}
