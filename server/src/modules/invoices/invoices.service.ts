import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto, CreateInvoiceLineItemDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService) {}

  // Invoices
  async createInvoice(createInvoiceDto: CreateInvoiceDto, userId: string) {
    const { lineItems, ...invoiceData } = createInvoiceDto;

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(userId);

    // Calculate totals if not provided
    const calculatedTotals = this.calculateInvoiceTotals(lineItems);
    const finalData = {
      ...invoiceData,
      ...calculatedTotals,
      invoiceNumber,
    };

    const invoice = await this.prisma.invoice.create({
      data: {
        ...finalData,
        userId,
      } as any,
      include: {
        lineItems: true,
        contact: true,
        quote: true,
        payments: true,
      },
    });

    // Create line items separately
    if (lineItems.length > 0) {
      await this.prisma.invoiceLineItem.createMany({
        data: lineItems.map(item => ({
          ...item,
          invoiceId: invoice.id,
          totalAmount: this.calculateLineItemTotal(item),
        })),
      });
    }

    return this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        lineItems: true,
        contact: true,
        quote: true,
        payments: true,
      },
    });
  }

  async findAllInvoices(userId: string, page = 1, limit = 10, search?: string, status?: InvoiceStatus) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      isActive: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as any } },
          { invoiceNumber: { contains: search, mode: 'insensitive' as any } },
        ],
      }),
      ...(status && { status }),
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          lineItems: true,
          contact: true,
          quote: true,
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findInvoiceById(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        lineItems: true,
        contact: true,
        quote: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string) {
    await this.findInvoiceById(id, userId);

    const { lineItems, ...invoiceData } = updateInvoiceDto;

    // If line items are provided, recalculate totals
    let calculatedTotals = {};
    if (lineItems) {
      calculatedTotals = this.calculateInvoiceTotals(lineItems);
    }

    const updateData = {
      ...invoiceData,
      ...calculatedTotals,
    };

    // If line items are provided, replace all existing ones
    if (lineItems) {
      await this.prisma.invoiceLineItem.deleteMany({
        where: { invoiceId: id },
      });

      const invoice = await this.prisma.invoice.update({
        where: { id },
        data: updateData as any,
        include: {
          lineItems: true,
          contact: true,
          quote: true,
          payments: true,
        },
      });

      // Create line items separately
      if (lineItems.length > 0) {
        await this.prisma.invoiceLineItem.createMany({
          data: lineItems.map(item => ({
            ...item,
            invoiceId: invoice.id,
            totalAmount: this.calculateLineItemTotal(item),
          })),
        });
      }

      return this.prisma.invoice.findUnique({
        where: { id: invoice.id },
        include: {
          lineItems: true,
          contact: true,
          quote: true,
          payments: true,
        },
      });
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData as any,
      include: {
        lineItems: true,
        contact: true,
        quote: true,
        payments: true,
      },
    });
  }

  async deleteInvoice(id: string, userId: string) {
    await this.findInvoiceById(id, userId);

    return this.prisma.invoice.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async sendInvoice(id: string, userId: string) {
    const invoice = await this.findInvoiceById(id, userId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be sent');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.SENT,
        sentAt: new Date(),
      },
    });
  }

  async markInvoiceAsViewed(id: string, userId: string) {
    const invoice = await this.findInvoiceById(id, userId);

    if (invoice.status !== InvoiceStatus.SENT) {
      throw new BadRequestException('Only sent invoices can be marked as viewed');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.VIEWED,
      },
    });
  }

  async markInvoiceAsPaid(id: string, userId: string) {
    const invoice = await this.findInvoiceById(id, userId);

    if (!['SENT', 'VIEWED', 'OVERDUE'].includes(invoice.status)) {
      throw new BadRequestException('Invoice must be sent, viewed, or overdue to be marked as paid');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: new Date(),
      },
    });
  }

  async cancelInvoice(id: string, userId: string) {
    const invoice = await this.findInvoiceById(id, userId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Paid invoices cannot be cancelled');
    }

    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.CANCELLED,
      },
    });
  }

  // Payments
  async createPayment(invoiceId: string, createPaymentDto: CreatePaymentDto, userId: string) {
    const invoice = await this.findInvoiceById(invoiceId, userId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid');
    }

    // Generate payment number
    const paymentNumber = await this.generatePaymentNumber(userId);

    const payment = await this.prisma.payment.create({
      data: {
        ...createPaymentDto,
        paymentNumber,
        userId,
        invoiceId,
        processedAt: createPaymentDto.processedAt ? new Date(createPaymentDto.processedAt) : new Date(),
      },
    });

    // If payment is completed, update invoice status
    if (payment.status === PaymentStatus.COMPLETED) {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });
    }

    return payment;
  }

  async findAllPayments(userId: string, page = 1, limit = 10, status?: PaymentStatus) {
    const skip = (page - 1) * limit;
    
    const where = {
      userId,
      ...(status && { status }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        include: {
          invoice: {
            include: {
              contact: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findPaymentById(id: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, userId },
      include: {
        invoice: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async updatePaymentStatus(id: string, status: PaymentStatus, userId: string) {
    const payment = await this.findPaymentById(id, userId);

    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: { status },
    });

    // If payment is completed, update invoice status
    if (status === PaymentStatus.COMPLETED) {
      await this.prisma.invoice.update({
        where: { id: payment.invoiceId },
        data: {
          status: InvoiceStatus.PAID,
          paidAt: new Date(),
        },
      });
    }

    return updatedPayment;
  }

  // Recurring Billing
  async processRecurringInvoices() {
    const recurringInvoices = await this.prisma.invoice.findMany({
      where: {
        isRecurring: true,
        isActive: true,
        status: {
          in: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
        },
      },
      include: {
        contact: true,
      },
    });

    const now = new Date();
    const newInvoices = [];

    for (const invoice of recurringInvoices) {
      const config = invoice.recurringConfig as any;
      if (!config) continue;

      const lastDueDate = invoice.dueDate || invoice.createdAt;
      const nextDueDate = this.calculateNextDueDate(lastDueDate, config);

      if (nextDueDate <= now) {
        // Check if we've reached max occurrences
        if (config.maxOccurrences) {
          const existingCount = await this.prisma.invoice.count({
            where: {
              userId: invoice.userId,
              contactId: invoice.contactId,
              isRecurring: true,
              createdAt: { gte: invoice.createdAt },
            },
          });

          if (existingCount >= config.maxOccurrences) {
            continue;
          }
        }

        // Check if we've reached end date
        if (config.endDate && new Date(config.endDate) <= now) {
          continue;
        }

        // Create new recurring invoice
        const newInvoice = await this.createRecurringInvoice(invoice, nextDueDate);
        newInvoices.push(newInvoice);
      }
    }

    return newInvoices;
  }

  // Financial Reports
  async getFinancialReports(userId: string, startDate?: Date, endDate?: Date) {
    const dateFilter = {
      ...(startDate && { gte: startDate }),
      ...(endDate && { lte: endDate }),
    };

    const [
      totalRevenue,
      outstandingPayments,
      overdueInvoices,
      monthlyRevenue,
      paymentMethods,
      invoiceStatuses,
    ] = await Promise.all([
      // Total revenue (paid invoices)
      this.prisma.invoice.aggregate({
        where: {
          userId,
          status: InvoiceStatus.PAID,
          paidAt: dateFilter,
        },
        _sum: { finalAmount: true },
      }),

      // Outstanding payments
      this.prisma.invoice.aggregate({
        where: {
          userId,
          status: {
            in: [InvoiceStatus.SENT, InvoiceStatus.VIEWED, InvoiceStatus.OVERDUE],
          },
          dueDate: dateFilter,
        },
        _sum: { finalAmount: true },
      }),

      // Overdue invoices
      this.prisma.invoice.aggregate({
        where: {
          userId,
          status: InvoiceStatus.OVERDUE,
          dueDate: { lt: new Date() },
        },
        _sum: { finalAmount: true },
      }),

      // Monthly revenue (last 12 months)
      this.prisma.invoice.groupBy({
        by: ['paidAt'],
        where: {
          userId,
          status: InvoiceStatus.PAID,
          paidAt: {
            gte: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1),
          },
        },
        _sum: { finalAmount: true },
      }),

      // Payment methods distribution
      this.prisma.payment.groupBy({
        by: ['method'],
        where: {
          userId,
          status: PaymentStatus.COMPLETED,
          processedAt: dateFilter,
        },
        _count: { id: true },
        _sum: { amount: true },
      }),

      // Invoice status distribution
      this.prisma.invoice.groupBy({
        by: ['status'],
        where: {
          userId,
          createdAt: dateFilter,
        },
        _count: { id: true },
        _sum: { finalAmount: true },
      }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.finalAmount || 0),
      outstandingPayments: Number(outstandingPayments._sum.finalAmount || 0),
      overdueInvoices: Number(overdueInvoices._sum.finalAmount || 0),
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item.paidAt,
        revenue: Number(item._sum.finalAmount || 0),
      })),
      paymentMethods: paymentMethods.map(item => ({
        method: item.method,
        count: item._count.id,
        amount: Number(item._sum.amount || 0),
      })),
      invoiceStatuses: invoiceStatuses.map(item => ({
        status: item.status,
        count: item._count.id,
        amount: Number(item._sum.finalAmount || 0),
      })),
    };
  }

  private async generateInvoiceNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private async generatePaymentNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.payment.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(year, 0, 1),
          lt: new Date(year + 1, 0, 1),
        },
      },
    });

    return `PAY-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private calculateLineItemTotal(lineItem: CreateInvoiceLineItemDto): number {
    const subtotal = lineItem.quantity * lineItem.unitPrice;
    const discount = subtotal * (lineItem.discount || 0) / 100;
    const afterDiscount = subtotal - discount;
    const tax = afterDiscount * (lineItem.taxRate || 0) / 100;
    return afterDiscount + tax;
  }

  private calculateInvoiceTotals(lineItems: CreateInvoiceLineItemDto[]) {
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

  private calculateNextDueDate(lastDueDate: Date, config: any): Date {
    const nextDate = new Date(lastDueDate);
    
    switch (config.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + config.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (config.interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + config.interval);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + config.interval);
        break;
    }

    return nextDate;
  }

  private async createRecurringInvoice(originalInvoice: any, dueDate: Date) {
    const { id, createdAt, updatedAt, paidAt, sentAt, viewedAt, overdueAt, ...invoiceData } = originalInvoice;

    return this.prisma.invoice.create({
      data: {
        ...invoiceData,
        dueDate,
        status: InvoiceStatus.DRAFT,
        lineItems: {
          create: originalInvoice.lineItems.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            discount: item.discount,
            totalAmount: item.totalAmount,
            notes: item.notes,
          })),
        },
      },
      include: {
        lineItems: true,
        contact: true,
        quote: true,
      },
    });
  }
}
