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
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CreateQuoteTemplateDto } from './dto/create-quote-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';

@ApiTags('quotes')
@Controller('quotes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // Quote Templates
  @Post('templates')
  @ApiOperation({ summary: 'Create quote template' })
  @ApiResponse({ status: 201, description: 'Quote template created successfully' })
  async createTemplate(
    @Body() createTemplateDto: CreateQuoteTemplateDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.createTemplate(createTemplateDto, user.id);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all quote templates' })
  @ApiResponse({ status: 200, description: 'Quote templates retrieved successfully' })
  async findAllTemplates(@CurrentUser() user: UserResponseDto) {
    return this.quotesService.findAllTemplates(user.id);
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get quote template by ID' })
  @ApiResponse({ status: 200, description: 'Quote template retrieved successfully' })
  async findTemplateById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.findTemplateById(id, user.id);
  }

  @Patch('templates/:id')
  @ApiOperation({ summary: 'Update quote template' })
  @ApiResponse({ status: 200, description: 'Quote template updated successfully' })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: Partial<CreateQuoteTemplateDto>,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.updateTemplate(id, updateTemplateDto, user.id);
  }

  @Delete('templates/:id')
  @ApiOperation({ summary: 'Delete quote template' })
  @ApiResponse({ status: 200, description: 'Quote template deleted successfully' })
  async deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.deleteTemplate(id, user.id);
  }

  // Quotes
  @Post()
  @ApiOperation({ summary: 'Create quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  async createQuote(
    @Body() createQuoteDto: CreateQuoteDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.createQuote(createQuoteDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotes' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  async findAllQuotes(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.quotesService.findAllQuotes(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status as any,
    );
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get quote analytics' })
  @ApiResponse({ status: 200, description: 'Quote analytics retrieved successfully' })
  async getQuoteAnalytics(@CurrentUser() user: UserResponseDto) {
    return this.quotesService.getQuoteAnalytics(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quote by ID' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  async findQuoteById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.findQuoteById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update quote' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  async updateQuote(
    @Param('id') id: string,
    @Body() updateQuoteDto: UpdateQuoteDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.updateQuote(id, updateQuoteDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete quote' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  async deleteQuote(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.deleteQuote(id, user.id);
  }

  // Quote Actions
  @Post(':id/send')
  @ApiOperation({ summary: 'Send quote' })
  @ApiResponse({ status: 200, description: 'Quote sent successfully' })
  async sendQuote(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.sendQuote(id, user.id);
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Mark quote as viewed' })
  @ApiResponse({ status: 200, description: 'Quote marked as viewed' })
  async markQuoteAsViewed(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.markQuoteAsViewed(id, user.id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept quote' })
  @ApiResponse({ status: 200, description: 'Quote accepted successfully' })
  async acceptQuote(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.acceptQuote(id, user.id);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject quote' })
  @ApiResponse({ status: 200, description: 'Quote rejected successfully' })
  async rejectQuote(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.quotesService.rejectQuote(id, user.id);
  }
}
