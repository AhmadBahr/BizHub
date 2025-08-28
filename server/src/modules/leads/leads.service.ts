import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto, LeadResponseDto } from './dto/lead.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto, userId: string): Promise<LeadResponseDto> {
    // Verify contact exists
    const contact = await this.prisma.contact.findFirst({
      where: { id: createLeadDto.contactId, userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    // If assigned to user, verify user exists
    if (createLeadDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: createLeadDto.assignedToId },
      });

      if (!user) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const { contactId, assignedToId, ...leadData } = createLeadDto;
    
    const lead = await this.prisma.lead.create({
      data: {
        ...leadData,
        user: { connect: { id: userId } },
        contact: contactId ? { connect: { id: contactId } } : undefined,
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...lead,
      value: Number(lead.value),
      status: lead.status as any,
      source: lead.source as any,
      contact: lead.contact,
    };
  }

  async findAll(query: LeadQueryDto): Promise<PaginationResponseDto> {
    const { page = 1, limit = 10, search, status, source, assignedToId, minScore, maxScore, minValue, maxValue, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (minScore !== undefined) {
      where.score = { ...where.score, gte: minScore };
    }

    if (maxScore !== undefined) {
      where.score = { ...where.score, lte: maxScore };
    }

    if (minValue !== undefined) {
      where.value = { ...where.value, gte: minValue };
    }

    if (maxValue !== undefined) {
      where.value = { ...where.value, lte: maxValue };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
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
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findById(id: string): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.findUnique({
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return {
      ...lead,
      value: Number(lead.value),
      status: lead.status as any,
      source: lead.source as any,
    };
  }

  async update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadResponseDto> {
    // Check if lead exists
    const existingLead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!existingLead) {
      throw new NotFoundException('Lead not found');
    }

    // If updating contact, verify it exists
    if (updateLeadDto.contactId) {
      const contact = await this.prisma.contact.findUnique({
        where: { id: updateLeadDto.contactId },
      });

      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    // If updating assigned user, verify user exists
    if (updateLeadDto.assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateLeadDto.assignedToId },
      });

      if (!user) {
        throw new NotFoundException('Assigned user not found');
      }
    }

    const lead = await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto,
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...lead,
      value: Number(lead.value),
      status: lead.status as any,
      source: lead.source as any,
    };
  }

  async remove(id: string): Promise<void> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.prisma.lead.delete({
      where: { id },
    });
  }

  async deactivate(id: string): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.update({
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...lead,
      value: Number(lead.value),
      status: lead.status as any,
      source: lead.source as any,
    };
  }

  async activate(id: string): Promise<LeadResponseDto> {
    const lead = await this.prisma.lead.update({
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
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return {
      ...lead,
      value: Number(lead.value),
      status: lead.status as any,
      source: lead.source as any,
    };
  }

  async getLeadStats() {
    const [total, byStatus, bySource, byScore, totalValue] = await Promise.all([
      this.prisma.lead.count({ where: { isActive: true } }),
      this.prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true },
        where: { isActive: true },
      }),
      this.prisma.lead.groupBy({
        by: ['source'],
        _count: { source: true },
        where: { isActive: true },
      }),
      this.prisma.lead.groupBy({
        by: ['score'],
        _count: { score: true },
        where: { isActive: true },
      }),
      this.prisma.lead.aggregate({
        where: { isActive: true },
        _sum: { value: true },
      }),
    ]);

    return {
      total,
      totalValue: Number(totalValue._sum.value || 0),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      bySource: bySource.map(item => ({
        source: item.source,
        count: item._count.source,
      })),
      byScore: byScore.map(item => ({
        score: item.score,
        count: item._count.score,
      })),
    };
  }
}
