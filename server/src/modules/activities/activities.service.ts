import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { Activity, ActivityType } from '@prisma/client';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const { userId, leadId, dealId, ...activityData } = createActivityDto;

    // Validate that the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate that the lead exists if provided
    if (leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId }
      });
      if (!lead) {
        throw new BadRequestException('Lead not found');
      }
    }

    // Validate that the deal exists if provided
    if (dealId) {
      const deal = await this.prisma.deal.findUnique({
        where: { id: dealId }
      });
      if (!deal) {
        throw new BadRequestException('Deal not found');
      }
    }

    return this.prisma.activity.create({
      data: {
        ...activityData,
        userId,
        leadId: leadId || null,
        dealId: dealId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    type?: ActivityType;
    userId?: string;
    leadId?: string;
    dealId?: string;
    search?: string;
  }): Promise<{ activities: Activity[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, type, userId, leadId, dealId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (leadId) {
      where.leadId = leadId;
    }

    if (dealId) {
      where.dealId = dealId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [activities, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          lead: {
            select: {
              id: true,
              title: true,
            },
          },
          deal: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { activities, total, page, limit };
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!activity || !activity.isActive) {
      throw new NotFoundException('Activity not found');
    }

    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity || !existingActivity.isActive) {
      throw new NotFoundException('Activity not found');
    }

    const { userId, leadId, dealId, ...activityData } = updateActivityDto;

    // Validate that the user exists if provided
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        throw new BadRequestException('User not found');
      }
    }

    // Validate that the lead exists if provided
    if (leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: leadId }
      });
      if (!lead) {
        throw new BadRequestException('Lead not found');
      }
    }

    // Validate that the deal exists if provided
    if (dealId) {
      const deal = await this.prisma.deal.findUnique({
        where: { id: dealId }
      });
      if (!deal) {
        throw new BadRequestException('Deal not found');
      }
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        ...activityData,
        userId: userId || existingActivity.userId,
        leadId: leadId || existingActivity.leadId,
        dealId: dealId || existingActivity.dealId,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity || !existingActivity.isActive) {
      throw new NotFoundException('Activity not found');
    }

    await this.prisma.activity.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getActivitiesByUser(userId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getActivitiesByLead(leadId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: {
        leadId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getActivitiesByDeal(dealId: string): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: {
        dealId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getUpcomingActivities(): Promise<Activity[]> {
    return this.prisma.activity.findMany({
      where: {
        isActive: true,
        scheduledAt: {
          gte: new Date(),
        },
        completedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async markAsCompleted(id: string): Promise<Activity> {
    const existingActivity = await this.prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity || !existingActivity.isActive) {
      throw new NotFoundException('Activity not found');
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        completedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
          },
        },
        deal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }
}
