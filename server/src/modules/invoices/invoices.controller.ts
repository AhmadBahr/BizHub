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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // Invoices
  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.createInvoice(createInvoiceDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  async findAllInvoices(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAllInvoices(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status as InvoiceStatus,
    );
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get financial reports' })
  @ApiResponse({ status: 200, description: 'Financial reports retrieved successfully' })
  async getFinancialReports(
    @CurrentUser() user: UserResponseDto,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.invoicesService.getFinancialReports(
      user.id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  async findInvoiceById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.findInvoiceById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  async updateInvoice(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.updateInvoice(id, updateInvoiceDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  async deleteInvoice(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.deleteInvoice(id, user.id);
  }

  // Invoice Actions
  @Post(':id/send')
  @ApiOperation({ summary: 'Send invoice' })
  @ApiResponse({ status: 200, description: 'Invoice sent successfully' })
  async sendInvoice(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.sendInvoice(id, user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Mark invoice as viewed' })
  @ApiResponse({ status: 200, description: 'Invoice marked as viewed' })
  async markInvoiceAsViewed(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.markInvoiceAsViewed(id, user.id);
  }

  @Post(':id/paid')
  @ApiOperation({ summary: 'Mark invoice as paid' })
  @ApiResponse({ status: 200, description: 'Invoice marked as paid' })
  async markInvoiceAsPaid(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.markInvoiceAsPaid(id, user.id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel invoice' })
  @ApiResponse({ status: 200, description: 'Invoice cancelled successfully' })
  async cancelInvoice(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.cancelInvoice(id, user.id);
  }

  // Payments
  @Post(':id/payments')
  @ApiOperation({ summary: 'Create payment for invoice' })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  async createPayment(
    @Param('id') invoiceId: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.createPayment(invoiceId, createPaymentDto, user.id);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async findAllPayments(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.invoicesService.findAllPayments(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status as PaymentStatus,
    );
  }

  @Get('payments/:id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment retrieved successfully' })
  async findPaymentById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.findPaymentById(id, user.id);
  }

  @Patch('payments/:id/status')
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('status') status: PaymentStatus,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.invoicesService.updatePaymentStatus(id, status, user.id);
  }

  // Recurring Billing
  @Post('recurring/process')
  @ApiOperation({ summary: 'Process recurring invoices' })
  @ApiResponse({ status: 200, description: 'Recurring invoices processed successfully' })
  async processRecurringInvoices(@CurrentUser() user: UserResponseDto) {
    return this.invoicesService.processRecurringInvoices();
  }
}
