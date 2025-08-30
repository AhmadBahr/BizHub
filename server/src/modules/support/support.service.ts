import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { TicketStatus, TicketPriority } from '@prisma/client';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  // Support Tickets
  async createTicket(createTicketDto: CreateSupportTicketDto, userId: string) {
    // Generate ticket number
    const ticketNumber = await this.generateTicketNumber(userId);

    return this.prisma.supportTicket.create({
      data: {
        ...createTicketDto,
        ticketNumber,
        userId,
        tags: createTicketDto.tags || [],
      },
      include: {
        contact: true,
        assignedTo: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async findAllTickets(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    status?: TicketStatus,
    priority?: TicketPriority,
    category?: string,
  ) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as any } },
          { ticketNumber: { contains: search, mode: 'insensitive' as any } },
          { description: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(category && { category }),
    };

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        include: {
          contact: true,
          assignedTo: true,
          replies: {
            include: {
              user: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findTicketById(id: string, userId: string) {
    const ticket = await this.prisma.supportTicket.findFirst({
      where: { id, userId },
      include: {
        contact: true,
        assignedTo: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    return ticket;
  }

  async updateTicket(id: string, updateTicketDto: UpdateSupportTicketDto, userId: string) {
    await this.findTicketById(id, userId);

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateTicketDto,
      include: {
        contact: true,
        assignedTo: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async deleteTicket(id: string, userId: string) {
    await this.findTicketById(id, userId);

    return this.prisma.supportTicket.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignTicket(id: string, assignedToId: string, userId: string) {
    await this.findTicketById(id, userId);

    return this.prisma.supportTicket.update({
      where: { id },
      data: { assignedToId },
      include: {
        contact: true,
        assignedTo: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateTicketStatus(id: string, status: TicketStatus, userId: string) {
    const ticket = await this.findTicketById(id, userId);

    const updateData: any = { status };

    // Set resolvedAt or closedAt based on status
    if (status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      updateData.closedAt = new Date();
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        contact: true,
        assignedTo: true,
        replies: {
          include: {
            user: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // Ticket Replies
  async createTicketReply(ticketId: string, createReplyDto: CreateTicketReplyDto, userId: string) {
    await this.findTicketById(ticketId, userId);

    return this.prisma.ticketReply.create({
      data: {
        ...createReplyDto,
        ticketId,
        userId,
      },
      include: {
        user: true,
      },
    });
  }

  async findAllTicketReplies(ticketId: string, userId: string) {
    await this.findTicketById(ticketId, userId);

    return this.prisma.ticketReply.findMany({
      where: { ticketId },
      include: {
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findTicketReplyById(id: string, userId: string) {
    const reply = await this.prisma.ticketReply.findFirst({
      where: { id, ticket: { userId } },
      include: {
        user: true,
        ticket: true,
      },
    });

    if (!reply) {
      throw new NotFoundException('Ticket reply not found');
    }

    return reply;
  }

  async updateTicketReply(id: string, content: string, userId: string) {
    const reply = await this.findTicketReplyById(id, userId);

    // Only allow updating own replies
    if (reply.userId !== userId) {
      throw new BadRequestException('You can only update your own replies');
    }

    return this.prisma.ticketReply.update({
      where: { id },
      data: { content },
      include: {
        user: true,
      },
    });
  }

  async deleteTicketReply(id: string, userId: string) {
    const reply = await this.findTicketReplyById(id, userId);

    // Only allow deleting own replies
    if (reply.userId !== userId) {
      throw new BadRequestException('You can only delete your own replies');
    }

    return this.prisma.ticketReply.delete({
      where: { id },
    });
  }

  // Knowledge Base
  async createKnowledgeBaseArticle(createArticleDto: CreateKnowledgeBaseDto, userId: string) {
    return this.prisma.knowledgeBase.create({
      data: {
        ...createArticleDto,
        userId,
        tags: createArticleDto.tags || [],
      },
    });
  }

  async findAllKnowledgeBaseArticles(
    userId: string,
    page = 1,
    limit = 10,
    search?: string,
    category?: string,
    isPublished?: boolean,
  ) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as any } },
          { content: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
      ...(category && { category }),
      ...(isPublished !== undefined && { isPublished }),
    };

    const [articles, total] = await Promise.all([
      this.prisma.knowledgeBase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.knowledgeBase.count({ where }),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findKnowledgeBaseArticleById(id: string, userId: string) {
    const article = await this.prisma.knowledgeBase.findFirst({
      where: { id, userId },
    });

    if (!article) {
      throw new NotFoundException('Knowledge base article not found');
    }

    return article;
  }

  async updateKnowledgeBaseArticle(id: string, updateArticleDto: Partial<CreateKnowledgeBaseDto>, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: updateArticleDto,
    });
  }

  async deleteKnowledgeBaseArticle(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.delete({
      where: { id },
    });
  }

  async publishKnowledgeBaseArticle(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: { isPublished: true },
    });
  }

  async unpublishKnowledgeBaseArticle(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async incrementViewCount(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async markArticleAsHelpful(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });
  }

  async markArticleAsNotHelpful(id: string, userId: string) {
    await this.findKnowledgeBaseArticleById(id, userId);

    return this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        notHelpfulCount: {
          increment: 1,
        },
      },
    });
  }

  // Analytics
  async getSupportAnalytics(userId: string) {
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime,
      priorityDistribution,
      statusDistribution,
      categoryDistribution,
      topCategories,
      responseTimeMetrics,
    ] = await Promise.all([
      // Total tickets
      this.prisma.supportTicket.count({ where: { userId, isActive: true } }),

      // Open tickets
      this.prisma.supportTicket.count({
        where: {
          userId,
          isActive: true,
          status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.WAITING_FOR_CUSTOMER] },
        },
      }),

      // Resolved tickets
      this.prisma.supportTicket.count({
        where: {
          userId,
          isActive: true,
          status: TicketStatus.RESOLVED,
        },
      }),

      // Closed tickets
      this.prisma.supportTicket.count({
        where: {
          userId,
          isActive: true,
          status: TicketStatus.CLOSED,
        },
      }),

      // Average resolution time (in hours) - simplified for now
      Promise.resolve({ _avg: { resolvedAt: null } }),

      // Priority distribution
      this.prisma.supportTicket.groupBy({
        by: ['priority'],
        where: { userId, isActive: true },
        _count: { id: true },
      }),

      // Status distribution
      this.prisma.supportTicket.groupBy({
        by: ['status'],
        where: { userId, isActive: true },
        _count: { id: true },
      }),

      // Category distribution
      this.prisma.supportTicket.groupBy({
        by: ['category'],
        where: { userId, isActive: true },
        _count: { id: true },
      }),

      // Top categories
      this.prisma.supportTicket.groupBy({
        by: ['category'],
        where: { userId, isActive: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),

      // Response time metrics
      this.prisma.ticketReply.groupBy({
        by: ['ticketId'],
        where: {
          ticket: { userId, isActive: true },
        },
        _min: { createdAt: true },
        having: {
          ticketId: {
            _count: { gt: 1 },
          },
        },
      }),
    ]);

    // Calculate average resolution time
    let avgResolutionTime = 0;
    if (resolvedTickets > 0) {
      const resolvedTicketsData = await this.prisma.supportTicket.findMany({
        where: {
          userId,
          isActive: true,
          status: TicketStatus.RESOLVED,
          resolvedAt: { not: null },
        },
        select: {
          createdAt: true,
          resolvedAt: true,
        },
      });

      const totalResolutionTime = resolvedTicketsData.reduce((total, ticket) => {
        const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
        return total + resolutionTime;
      }, 0);

      avgResolutionTime = totalResolutionTime / resolvedTicketsData.length / (1000 * 60 * 60); // Convert to hours
    }

    // Calculate average response time
    let avgResponseTime = 0;
    if (responseTimeMetrics.length > 0) {
      const ticketsWithReplies = await this.prisma.supportTicket.findMany({
        where: {
          userId,
          isActive: true,
          replies: {
            some: {},
          },
        },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
            take: 1, // Get first reply only
          },
        },
      });

      const totalResponseTime = ticketsWithReplies.reduce((total, ticket) => {
        if (ticket.replies.length > 0) {
          const firstReply = ticket.replies[0];
          const responseTime = firstReply.createdAt.getTime() - ticket.createdAt.getTime();
          return total + responseTime;
        }
        return total;
      }, 0);

      avgResponseTime = totalResponseTime / ticketsWithReplies.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime: avgResolutionTime,
      averageResponseTime: avgResponseTime,
      priorityDistribution: priorityDistribution.map(item => ({
        priority: item.priority,
        count: item._count.id,
      })),
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: item._count.id,
      })),
      categoryDistribution: categoryDistribution.map(item => ({
        category: item.category,
        count: item._count.id,
      })),
      topCategories: topCategories.map(item => ({
        category: item.category,
        count: item._count.id,
      })),
    };
  }

  /**
   * Get detailed time-based analytics for support tickets
   */
  async getTimeBasedAnalytics(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      resolutionTimeByPriority,
      responseTimeByPriority,
      resolutionTimeByCategory,
      responseTimeByCategory,
      timeToFirstResponse,
      timeToResolution,
      slaCompliance,
    ] = await Promise.all([
      // Resolution time by priority
      this.getResolutionTimeByPriority(userId),
      
      // Response time by priority
      this.getResponseTimeByPriority(userId),
      
      // Resolution time by category
      this.getResolutionTimeByCategory(userId),
      
      // Response time by category
      this.getResponseTimeByCategory(userId),
      
      // Time to first response (overall)
      this.getTimeToFirstResponse(userId),
      
      // Time to resolution (overall)
      this.getTimeToResolution(userId),
      
      // SLA compliance
      this.getSLACompliance(userId),
    ]);

    return {
      resolutionTimeByPriority,
      responseTimeByPriority,
      resolutionTimeByCategory,
      responseTimeByCategory,
      timeToFirstResponse,
      timeToResolution,
      slaCompliance,
    };
  }

  /**
   * Get resolution time breakdown by priority
   */
  private async getResolutionTimeByPriority(userId: string) {
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        status: TicketStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        priority: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const priorityGroups: Record<string, number[]> = {};
    resolvedTickets.forEach(ticket => {
      if (!priorityGroups[ticket.priority]) {
        priorityGroups[ticket.priority] = [];
      }
      const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      priorityGroups[ticket.priority].push(resolutionTime);
    });

    return Object.entries(priorityGroups).map(([priority, times]) => ({
      priority,
      averageHours: times.reduce((sum, time) => sum + time, 0) / times.length / (1000 * 60 * 60),
      count: times.length,
      minHours: Math.min(...times) / (1000 * 60 * 60),
      maxHours: Math.max(...times) / (1000 * 60 * 60),
    }));
  }

  /**
   * Get response time breakdown by priority
   */
  private async getResponseTimeByPriority(userId: string) {
    const ticketsWithReplies = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        replies: { some: {} },
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const priorityGroups: Record<string, number[]> = {};
    ticketsWithReplies.forEach(ticket => {
      if (ticket.replies.length > 0) {
        if (!priorityGroups[ticket.priority]) {
          priorityGroups[ticket.priority] = [];
        }
        const responseTime = ticket.replies[0].createdAt.getTime() - ticket.createdAt.getTime();
        priorityGroups[ticket.priority].push(responseTime);
      }
    });

    return Object.entries(priorityGroups).map(([priority, times]) => ({
      priority,
      averageHours: times.reduce((sum, time) => sum + time, 0) / times.length / (1000 * 60 * 60),
      count: times.length,
      minHours: Math.min(...times) / (1000 * 60 * 60),
      maxHours: Math.max(...times) / (1000 * 60 * 60),
    }));
  }

  /**
   * Get resolution time breakdown by category
   */
  private async getResolutionTimeByCategory(userId: string) {
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        status: TicketStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        category: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    const categoryGroups: Record<string, number[]> = {};
    resolvedTickets.forEach(ticket => {
      if (!categoryGroups[ticket.category]) {
        categoryGroups[ticket.category] = [];
      }
      const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      categoryGroups[ticket.category].push(resolutionTime);
    });

    return Object.entries(categoryGroups).map(([category, times]) => ({
      category,
      averageHours: times.reduce((sum, time) => sum + time, 0) / times.length / (1000 * 60 * 60),
      count: times.length,
      minHours: Math.min(...times) / (1000 * 60 * 60),
      maxHours: Math.max(...times) / (1000 * 60 * 60),
    }));
  }

  /**
   * Get response time breakdown by category
   */
  private async getResponseTimeByCategory(userId: string) {
    const ticketsWithReplies = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        replies: { some: {} },
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const categoryGroups: Record<string, number[]> = {};
    ticketsWithReplies.forEach(ticket => {
      if (ticket.replies.length > 0) {
        if (!categoryGroups[ticket.category]) {
          categoryGroups[ticket.category] = [];
        }
        const responseTime = ticket.replies[0].createdAt.getTime() - ticket.createdAt.getTime();
        categoryGroups[ticket.category].push(responseTime);
      }
    });

    return Object.entries(categoryGroups).map(([category, times]) => ({
      category,
      averageHours: times.reduce((sum, time) => sum + time, 0) / times.length / (1000 * 60 * 60),
      count: times.length,
      minHours: Math.min(...times) / (1000 * 60 * 60),
      maxHours: Math.max(...times) / (1000 * 60 * 60),
    }));
  }

  /**
   * Get time to first response metrics
   */
  private async getTimeToFirstResponse(userId: string) {
    const ticketsWithReplies = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        replies: { some: {} },
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const responseTimes = ticketsWithReplies
      .filter(ticket => ticket.replies.length > 0)
      .map(ticket => ticket.replies[0].createdAt.getTime() - ticket.createdAt.getTime());

    if (responseTimes.length === 0) {
      return {
        averageHours: 0,
        medianHours: 0,
        minHours: 0,
        maxHours: 0,
        count: 0,
      };
    }

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedTimes.length / 2);
    const medianTime = sortedTimes.length % 2 === 0
      ? (sortedTimes[medianIndex - 1] + sortedTimes[medianIndex]) / 2
      : sortedTimes[medianIndex];

    return {
      averageHours: responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60 * 60),
      medianHours: medianTime / (1000 * 60 * 60),
      minHours: Math.min(...responseTimes) / (1000 * 60 * 60),
      maxHours: Math.max(...responseTimes) / (1000 * 60 * 60),
      count: responseTimes.length,
    };
  }

  /**
   * Get time to resolution metrics
   */
  private async getTimeToResolution(userId: string) {
    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        status: TicketStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    const resolutionTimes = resolvedTickets.map(ticket => 
      ticket.resolvedAt.getTime() - ticket.createdAt.getTime()
    );

    if (resolutionTimes.length === 0) {
      return {
        averageHours: 0,
        medianHours: 0,
        minHours: 0,
        maxHours: 0,
        count: 0,
      };
    }

    const sortedTimes = resolutionTimes.sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedTimes.length / 2);
    const medianTime = sortedTimes.length % 2 === 0
      ? (sortedTimes[medianIndex - 1] + sortedTimes[medianIndex]) / 2
      : sortedTimes[medianIndex];

    return {
      averageHours: resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length / (1000 * 60 * 60),
      medianHours: medianTime / (1000 * 60 * 60),
      minHours: Math.min(...resolutionTimes) / (1000 * 60 * 60),
      maxHours: Math.max(...resolutionTimes) / (1000 * 60 * 60),
      count: resolutionTimes.length,
    };
  }

  /**
   * Get SLA compliance metrics
   */
  private async getSLACompliance(userId: string) {
    // Define SLA targets (in hours)
    const slaTargets = {
      [TicketPriority.LOW]: { response: 24, resolution: 72 },
      [TicketPriority.MEDIUM]: { response: 8, resolution: 48 },
      [TicketPriority.HIGH]: { response: 4, resolution: 24 },
      [TicketPriority.URGENT]: { response: 1, resolution: 8 },
    };

    const ticketsWithReplies = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        replies: { some: {} },
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });

    const resolvedTickets = await this.prisma.supportTicket.findMany({
      where: {
        userId,
        isActive: true,
        status: TicketStatus.RESOLVED,
        resolvedAt: { not: null },
      },
      select: {
        priority: true,
        createdAt: true,
        resolvedAt: true,
      },
    });

    // Calculate response time compliance
    const responseCompliance = ticketsWithReplies
      .filter(ticket => ticket.replies.length > 0)
      .map(ticket => {
        const responseTime = ticket.replies[0].createdAt.getTime() - ticket.createdAt.getTime();
        const responseTimeHours = responseTime / (1000 * 60 * 60);
        const target = slaTargets[ticket.priority]?.response || 24;
        return {
          priority: ticket.priority,
          responseTimeHours,
          target,
          compliant: responseTimeHours <= target,
        };
      });

    // Calculate resolution time compliance
    const resolutionCompliance = resolvedTickets.map(ticket => {
      const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
      const resolutionTimeHours = resolutionTime / (1000 * 60 * 60);
      const target = slaTargets[ticket.priority]?.resolution || 72;
      return {
        priority: ticket.priority,
        resolutionTimeHours,
        target,
        compliant: resolutionTimeHours <= target,
      };
    });

    // Calculate overall compliance rates
    const responseCompliant = responseCompliance.filter(t => t.compliant).length;
    const resolutionCompliant = resolutionCompliance.filter(t => t.compliant).length;

    return {
      responseTime: {
        total: responseCompliance.length,
        compliant: responseCompliant,
        complianceRate: responseCompliance.length > 0 ? (responseCompliant / responseCompliance.length) * 100 : 0,
        breakdown: responseCompliance,
      },
      resolutionTime: {
        total: resolutionCompliance.length,
        compliant: resolutionCompliant,
        complianceRate: resolutionCompliance.length > 0 ? (resolutionCompliant / resolutionCompliance.length) * 100 : 0,
        breakdown: resolutionCompliance,
      },
      slaTargets,
    };
  }

  private async generateTicketNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.supportTicket.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `TKT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
}
