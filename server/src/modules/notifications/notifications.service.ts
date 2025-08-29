import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto, NotificationType } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Note: Real-time notification would be sent via events or a different pattern
    // to avoid circular dependency

    return notification;
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
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
        },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.notification.deleteMany({
      where: { id, userId },
    });
  }

  // Helper methods for creating specific types of notifications
  async createLeadNotification(userId: string, message: string, leadId?: string) {
    return this.create({
      userId,
      title: 'New Lead',
      message,
      type: NotificationType.LEAD,
      relatedId: leadId,
    });
  }

  async createDealNotification(userId: string, message: string, dealId?: string) {
    return this.create({
      userId,
      title: 'Deal Update',
      message,
      type: NotificationType.DEAL,
      relatedId: dealId,
    });
  }

  async createTaskNotification(userId: string, message: string, taskId?: string) {
    return this.create({
      userId,
      title: 'Task Reminder',
      message,
      type: NotificationType.TASK,
      relatedId: taskId,
    });
  }

  async createSystemNotification(userId: string, message: string) {
    return this.create({
      userId,
      title: 'System Notification',
      message,
      type: NotificationType.SYSTEM,
    });
  }
}
