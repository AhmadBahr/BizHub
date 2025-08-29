import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDealDto, UpdateDealDto, DealQueryDto, DealResponseDto } from './dto/deal.dto';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(createDealDto: CreateDealDto, userId: string): Promise<DealResponseDto> {
    // Validate that the contact exists
    const contact = await this.prisma.contact.findFirst({
      where: { id: createDealDto.contactId, userId },
    });
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    // Validate that the lead exists if provided
    if (createDealDto.leadId) {
      const lead = await this.prisma.lead.findFirst({
        where: { id: createDealDto.leadId, userId },
      });
      if (!lead) {
        throw new BadRequestException('Lead not found');
      }
    }

    // Validate that the assigned user exists
    if (createDealDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createDealDto.assignedToId },
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const { contactId, leadId, assignedToId, ...dealData } = createDealDto;
    
    const deal = await this.prisma.deal.create({
      data: {
        ...dealData,
        user: { connect: { id: userId } },
        contact: contactId ? { connect: { id: contactId } } : undefined,
        lead: leadId ? { connect: { id: leadId } } : undefined,
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            source: true,
            score: true,
            value: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...deal,
      value: Number(deal.value),
      status: deal.status as any,
      contact: deal.contact,
      lead: deal.lead ? {
        ...deal.lead,
        value: Number(deal.lead.value),
      } : undefined,
      assignedTo: deal.assignedTo,
    };
  }

  async findAll(query: DealQueryDto) {
    const { page = 1, limit = 10, search, status, assignedToId, minValue, maxValue, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: isActive !== undefined ? isActive : true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { lead: { title: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (minValue !== undefined || maxValue !== undefined) {
      where.value = {};
      if (minValue !== undefined) where.value.gte = minValue;
      if (maxValue !== undefined) where.value.lte = maxValue;
    }

    const [deals, total] = await Promise.all([
      this.prisma.deal.findMany({
        where,
        include: {
          contact: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              company: true,
            },
          },
          lead: {
            select: {
              id: true,
              title: true,
              description: true,
              status: true,
              source: true,
              score: true,
              value: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.deal.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: deals.map(deal => ({
        ...deal,
        value: Number(deal.value),
        contact: deal.contact,
        status: deal.status as any,
        lead: deal.lead ? {
          ...deal.lead,
          value: Number(deal.lead.value),
        } : undefined,
        assignedTo: deal.assignedTo,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<DealResponseDto> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            source: true,
            score: true,
            value: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    return {
      ...deal,
      value: Number(deal.value),
      status: deal.status as any,
      contact: deal.contact,
      lead: deal.lead ? {
        ...deal.lead,
        value: Number(deal.lead.value),
      } : undefined,
      assignedTo: deal.assignedTo,
    };
  }

  async update(id: string, updateDealDto: UpdateDealDto): Promise<DealResponseDto> {
    // Validate that the deal exists
    const existingDeal = await this.prisma.deal.findUnique({
      where: { id },
    });
    if (!existingDeal) {
      throw new NotFoundException('Deal not found');
    }

    // Validate that the contact exists if being updated
    if (updateDealDto.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: updateDealDto.contactId },
      });
      if (!contact) {
        throw new BadRequestException('Contact not found');
      }
    }

    // Validate that the lead exists if being updated
    if (updateDealDto.leadId) {
      const lead = await this.prisma.lead.findUnique({
        where: { id: updateDealDto.leadId },
      });
      if (!lead) {
        throw new BadRequestException('Lead not found');
      }
    }

    // Validate that the assigned user exists if being updated
    if (updateDealDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateDealDto.assignedToId },
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateDealDto,
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            source: true,
            score: true,
            value: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...deal,
      value: Number(deal.value),
      status: deal.status as any,
      contact: deal.contact,
      lead: deal.lead ? {
        ...deal.lead,
        value: Number(deal.lead.value),
      } : undefined,
      assignedTo: deal.assignedTo,
    };
  }

  async remove(id: string): Promise<void> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    await this.prisma.deal.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<DealResponseDto> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: { isActive: false },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            source: true,
            score: true,
            value: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...updatedDeal,
      value: Number(updatedDeal.value),
      status: updatedDeal.status as any,
      contact: updatedDeal.contact,
      lead: updatedDeal.lead ? {
        ...updatedDeal.lead,
        value: Number(updatedDeal.lead.value),
      } : undefined,
      assignedTo: updatedDeal.assignedTo,
    };
  }

  async activate(id: string): Promise<DealResponseDto> {
    const deal = await this.prisma.deal.findUnique({
      where: { id },
    });
    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    const updatedDeal = await this.prisma.deal.update({
      where: { id },
      data: { isActive: true },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
          },
        },
        lead: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            source: true,
            score: true,
            value: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      ...updatedDeal,
      value: Number(updatedDeal.value),
      status: updatedDeal.status as any,
      contact: updatedDeal.contact,
      lead: updatedDeal.lead ? {
        ...updatedDeal.lead,
        value: Number(updatedDeal.lead.value),
      } : undefined,
      assignedTo: updatedDeal.assignedTo,
    };
  }

  async getDealStats() {
    const [
      totalDeals,
      activeDeals,
      closedDeals,
      totalValue,
      avgValue,
      dealsByStatus,
    ] = await Promise.all([
      this.prisma.deal.count({ where: { isActive: true } }),
      this.prisma.deal.count({ where: { isActive: true, status: 'OPPORTUNITY' } }),
      this.prisma.deal.count({ where: { isActive: true, status: 'CLOSED_WON' } }),
      this.prisma.deal.aggregate({
        where: { isActive: true },
        _sum: { value: true },
      }),
      this.prisma.deal.aggregate({
        where: { isActive: true },
        _avg: { value: true },
      }),
      this.prisma.deal.groupBy({
        by: ['status'],
        where: { isActive: true },
        _count: true,
      }),
    ]);

    return {
      totalDeals,
      activeDeals,
      closedDeals,
      totalValue: Number(totalValue._sum.value || 0),
      avgValue: Number(avgValue._avg.value || 0),
      dealsByStatus: dealsByStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
    };
  }
}
