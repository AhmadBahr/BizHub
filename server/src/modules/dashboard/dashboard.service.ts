import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const [
      totalContacts,
      totalLeads,
      totalDeals,
      totalTasks,
      totalActivities,
      activeLeads,
      activeDeals,
      pendingTasks,
      completedTasks,
      revenueMetrics,
      leadSourceStats,
      leadStatusStats,
      dealStatusStats,
      recentActivities,
      upcomingTasks,
      topDeals,
    ] = await Promise.all([
      this.prisma.contact.count({ where: { isActive: true } }),
      this.prisma.lead.count({ where: { isActive: true } }),
      this.prisma.deal.count({ where: { isActive: true } }),
      this.prisma.task.count({ where: { isActive: true } }),
      this.prisma.activity.count({ where: { isActive: true } }),
      this.prisma.lead.count({ 
        where: { 
          isActive: true,
          status: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
        } 
      }),
      this.prisma.deal.count({ 
        where: { 
          isActive: true,
          status: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] }
        } 
      }),
      this.prisma.task.count({ 
        where: { 
          isActive: true,
          status: { in: ['PENDING', 'IN_PROGRESS'] }
        } 
      }),
      this.prisma.task.count({ 
        where: { 
          isActive: true,
          status: 'COMPLETED'
        } 
      }),
      this.getRevenueMetrics(),
      this.getLeadSourceStats(),
      this.getLeadStatusStats(),
      this.getDealStatusStats(),
      this.getRecentActivities(),
      this.getUpcomingTasks(),
      this.getTopDeals(),
    ]);

    return {
      overview: {
        totalContacts,
        totalLeads,
        totalDeals,
        totalTasks,
        totalActivities,
        activeLeads,
        activeDeals,
        pendingTasks,
        completedTasks,
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
      revenue: revenueMetrics,
      leadSourceStats,
      leadStatusStats,
      dealStatusStats,
      recentActivities,
      upcomingTasks,
      topDeals,
    };
  }

  private async getRevenueMetrics() {
    const deals = await this.prisma.deal.findMany({
      where: { isActive: true },
      select: {
        value: true,
        status: true,
        expectedCloseDate: true,
        actualCloseDate: true,
      },
    });

    const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
    const wonValue = deals
      .filter(deal => deal.status === 'CLOSED_WON')
      .reduce((sum, deal) => sum + Number(deal.value), 0);
    const pipelineValue = deals
      .filter(deal => deal.status !== 'CLOSED_WON' && deal.status !== 'CLOSED_LOST')
      .reduce((sum, deal) => sum + Number(deal.value), 0);

    // Calculate monthly revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await this.prisma.deal.groupBy({
      by: ['actualCloseDate'],
      _sum: { value: true },
      where: {
        isActive: true,
        status: 'CLOSED_WON',
        actualCloseDate: { gte: sixMonthsAgo },
      },
    });

    const monthlyData = monthlyRevenue.map(item => ({
      month: item.actualCloseDate,
      revenue: Number(item._sum.value || 0),
    }));

    return {
      totalValue,
      wonValue,
      pipelineValue,
      winRate: totalValue > 0 ? (wonValue / totalValue) * 100 : 0,
      monthlyRevenue: monthlyData,
    };
  }

  private async getLeadSourceStats() {
    const stats = await this.prisma.lead.groupBy({
      by: ['source'],
      _count: { source: true },
      where: { isActive: true },
    });

    return stats.map(item => ({
      source: item.source,
      count: item._count.source,
    }));
  }

  private async getLeadStatusStats() {
    const stats = await this.prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
      where: { isActive: true },
    });

    return stats.map(item => ({
      status: item.status,
      count: item._count.status,
    }));
  }

  private async getDealStatusStats() {
    const stats = await this.prisma.deal.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { value: true },
      where: { isActive: true },
    });

    return stats.map(item => ({
      status: item.status,
      count: item._count.status,
      value: Number(item._sum.value || 0),
    }));
  }

  private async getRecentActivities() {
    return this.prisma.activity.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
      take: 10,
    });
  }

  private async getUpcomingTasks() {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    return this.prisma.task.findMany({
      where: {
        isActive: true,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lte: nextWeek },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
  }

  private async getTopDeals() {
    return this.prisma.deal.findMany({
      where: { isActive: true },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            company: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { value: 'desc' },
      take: 10,
    });
  }

  async getSalesPerformance(userId?: string) {
    const where = userId ? { assignedToId: userId, isActive: true } : { isActive: true };

    const [leads, deals, activities] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          value: true,
          createdAt: true,
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.deal.findMany({
        where,
        select: {
          id: true,
          title: true,
          status: true,
          value: true,
          probability: true,
          expectedCloseDate: true,
          assignedTo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { expectedCloseDate: 'asc' },
        take: 20,
      }),
      this.prisma.activity.findMany({
        where,
        select: {
          id: true,
          type: true,
          title: true,
          scheduledAt: true,
          completedAt: true,
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
        take: 20,
      }),
    ]);

    return {
      leads,
      deals,
      activities,
    };
  }
}
