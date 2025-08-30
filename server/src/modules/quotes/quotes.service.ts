import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuoteDto, CreateQuoteLineItemDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  // Quote Templates
  async createTemplate(createTemplateDto: CreateQuoteTemplateDto, userId: string) {
    return this.prisma.quoteTemplate.create({
      data: {
        ...createTemplateDto,
        userId,
        variables: createTemplateDto.variables || {},
      },
    });
  }

  async findAllTemplates(userId: string) {
    return this.prisma.quoteTemplate.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findTemplateById(id: string, userId: string) {
    const template = await this.prisma.quoteTemplate.findFirst({
      where: { id, userId },
    });

    if (!template) {
      throw new NotFoundException('Quote template not found');
    }

    return template;
  }

  async updateTemplate(id: string, updateTemplateDto: Partial<CreateQuoteTemplateDto>, userId: string) {
    await this.findTemplateById(id, userId);

    return this.prisma.quoteTemplate.update({
      where: { id },
      data: updateTemplateDto,
    });
  }

  async deleteTemplate(id: string, userId: string) {
    await this.findTemplateById(id, userId);

    return this.prisma.quoteTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Quotes
  async createQuote(createQuoteDto: CreateQuoteDto, userId: string) {
    const { lineItems, ...quoteData } = createQuoteDto;

    // Generate quote number
    const quoteNumber = await this.generateQuoteNumber(userId);

    // Calculate totals if not provided
    const calculatedTotals = this.calculateQuoteTotals(lineItems);
    const finalData = {
      ...quoteData,
      ...calculatedTotals,
      quoteNumber,
    };

    const quote = await this.prisma.quote.create({
      data: {
        ...finalData,
        userId,
      } as any,
      include: {
        lineItems: true,
        contact: true,
        deal: true,
        template: true,
      },
    });

    // Create line items separately
    if (lineItems.length > 0) {
      await this.prisma.quoteLineItem.createMany({
        data: lineItems.map(item => ({
          ...item,
          quoteId: quote.id,
          totalAmount: this.calculateLineItemTotal(item),
        })),
      });
    }

    return this.prisma.quote.findUnique({
      where: { id: quote.id },
      include: {
        lineItems: true,
        contact: true,
        deal: true,
        template: true,
      },
    });
  }

  async findAllQuotes(userId: string, page = 1, limit = 10, search?: string, status?: QuoteStatus) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as any } },
          { quoteNumber: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
      ...(status && { status }),
    };

    const [quotes, total] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        include: {
          lineItems: true,
          contact: true,
          deal: true,
          template: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findQuoteById(id: string, userId: string) {
    const quote = await this.prisma.quote.findFirst({
      where: { id, userId },
      include: {
        lineItems: true,
        contact: true,
        deal: true,
        template: true,
        invoices: true,
      },
    });

    if (!quote) {
      throw new NotFoundException('Quote not found');
    }

    return quote;
  }

  async updateQuote(id: string, updateQuoteDto: UpdateQuoteDto, userId: string) {
    await this.findQuoteById(id, userId);

    const { lineItems, ...quoteData } = updateQuoteDto;

    // If line items are provided, recalculate totals
    let calculatedTotals = {};
    if (lineItems) {
      calculatedTotals = this.calculateQuoteTotals(lineItems);
    }

    const updateData = {
      ...quoteData,
      ...calculatedTotals,
    };

    // If line items are provided, replace all existing ones
    if (lineItems) {
      await this.prisma.quoteLineItem.deleteMany({
        where: { quoteId: id },
      });

      const quote = await this.prisma.quote.update({
        where: { id },
        data: updateData as any,
        include: {
          lineItems: true,
          contact: true,
          deal: true,
          template: true,
        },
      });

      // Create line items separately
      if (lineItems.length > 0) {
        await this.prisma.quoteLineItem.createMany({
          data: lineItems.map(item => ({
            ...item,
            quoteId: quote.id,
            totalAmount: this.calculateLineItemTotal(item),
          })),
        });
      }

      return this.prisma.quote.findUnique({
        where: { id: quote.id },
        include: {
          lineItems: true,
          contact: true,
          deal: true,
          template: true,
        },
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        lineItems: true,
        contact: true,
        deal: true,
        template: true,
      },
    });
  }

  async deleteQuote(id: string, userId: string) {
    await this.findQuoteById(id, userId);

    return this.prisma.quote.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async sendQuote(id: string, userId: string) {
    const quote = await this.findQuoteById(id, userId);

    if (quote.status !== QuoteStatus.DRAFT) {
      throw new BadRequestException('Only draft quotes can be sent');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  async markQuoteAsViewed(id: string, userId: string) {
    const quote = await this.findQuoteById(id, userId);

    if (quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException('Only sent quotes can be marked as viewed');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.VIEWED,
        viewedAt: new Date(),
      },
    });
  }

  async acceptQuote(id: string, userId: string) {
    const quote = await this.findQuoteById(id, userId);

    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      throw new BadRequestException('Quote must be sent or viewed to be accepted');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
    });
  }

  async rejectQuote(id: string, userId: string) {
    const quote = await this.findQuoteById(id, userId);

    if (!['SENT', 'VIEWED'].includes(quote.status)) {
      throw new BadRequestException('Quote must be sent or viewed to be rejected');
    }

    return this.prisma.quote.update({
      where: { id },
      data: {
        status: QuoteStatus.REJECTED,
        rejectedAt: new Date(),
      },
    });
  }

  async getQuoteAnalytics(userId: string) {
    const [
      totalQuotes,
      sentQuotes,
      acceptedQuotes,
      rejectedQuotes,
      expiredQuotes,
      totalValue,
      acceptedValue,
      averageQuoteValue,
      quoteToCloseRatio,
    ] = await Promise.all([
      this.prisma.quote.count({ where: { userId, isActive: true } }),
      this.prisma.quote.count({ where: { userId, status: QuoteStatus.SENT, isActive: true } }),
      this.prisma.quote.count({ where: { userId, status: QuoteStatus.ACCEPTED, isActive: true } }),
      this.prisma.quote.count({ where: { userId, status: QuoteStatus.REJECTED, isActive: true } }),
      this.prisma.quote.count({ where: { userId, status: QuoteStatus.EXPIRED, isActive: true } }),
      this.prisma.quote.aggregate({
        where: { userId, isActive: true },
        _sum: { finalAmount: true },
      }),
      this.prisma.quote.aggregate({
        where: { userId, status: QuoteStatus.ACCEPTED, isActive: true },
        _sum: { finalAmount: true },
      }),
      this.prisma.quote.aggregate({
        where: { userId, isActive: true },
        _avg: { finalAmount: true },
      }),
      this.prisma.quote.groupBy({
        by: ['status'],
        where: { userId, isActive: true },
        _count: { id: true },
        _sum: { finalAmount: true },
      }),
    ]);

    const ratio = totalQuotes > 0 ? (acceptedQuotes / totalQuotes) * 100 : 0;

    return {
      totalQuotes,
      sentQuotes,
      acceptedQuotes,
      rejectedQuotes,
      expiredQuotes,
      totalValue: Number(totalValue._sum.finalAmount || 0),
      acceptedValue: Number(acceptedValue._sum.finalAmount || 0),
      averageQuoteValue: Number(averageQuoteValue._avg.finalAmount || 0),
      quoteToCloseRatio: ratio,
      statusDistribution: quoteToCloseRatio.map(item => ({
        status: item.status,
        count: item._count.id,
        value: Number(item._sum.finalAmount || 0),
      })),
    };
  }

  private async generateQuoteNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quote.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `Q-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private calculateLineItemTotal(lineItem: CreateQuoteLineItemDto): number {
    const subtotal = lineItem.quantity * lineItem.unitPrice;
    const discount = subtotal * (lineItem.discount || 0) / 100;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (lineItem.taxRate || 0) / 100;
    return afterDiscount + tax;
  }

  private calculateQuoteTotals(lineItems: CreateQuoteLineItemDto[]) {
    const subtotal = lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);

    const totalDiscount = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * (item.discount || 0) / 100);
    }, 0);

    const afterDiscount = subtotal - totalDiscount;

    const totalTax = lineItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount || 0) / 100;
      const itemAfterDiscount = itemSubtotal - itemDiscount;
      return sum + (itemAfterDiscount * (item.taxRate || 0) / 100);
    }, 0);

    return {
      totalAmount: subtotal,
      discountAmount: totalDiscount,
      taxAmount: totalTax,
      finalAmount: afterDiscount + totalTax,
    };
  }
}
