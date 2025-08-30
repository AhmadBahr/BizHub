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
import { SupportService } from './support.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { UpdateSupportTicketDto } from './dto/update-support-ticket.dto';
import { CreateTicketReplyDto } from './dto/create-ticket-reply.dto';
import { CreateKnowledgeBaseDto } from './dto/create-knowledge-base.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/user.dto';
import { TicketStatus, TicketPriority } from '@prisma/client';

@ApiTags('support')
@Controller('support')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Support Tickets
  @Post('tickets')
  @ApiOperation({ summary: 'Create support ticket' })
  @ApiResponse({ status: 201, description: 'Support ticket created successfully' })
  async createTicket(
    @Body() createTicketDto: CreateSupportTicketDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.createTicket(createTicketDto, user.id);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'Get all support tickets' })
  @ApiResponse({ status: 200, description: 'Support tickets retrieved successfully' })
  async findAllTickets(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('category') category?: string,
  ) {
    return this.supportService.findAllTickets(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status as TicketStatus,
      priority as TicketPriority,
      category,
    );
  }

  @Get('tickets/analytics')
  @ApiOperation({ summary: 'Get support analytics' })
  @ApiResponse({ status: 200, description: 'Support analytics retrieved successfully' })
  async getSupportAnalytics(@CurrentUser() user: UserResponseDto) {
    return this.supportService.getSupportAnalytics(user.id);
  }

  @Get('tickets/time-analytics')
  @ApiOperation({ summary: 'Get detailed time-based analytics' })
  @ApiResponse({ status: 200, description: 'Time-based analytics retrieved successfully' })
  async getTimeBasedAnalytics(@CurrentUser() user: UserResponseDto) {
    return this.supportService.getTimeBasedAnalytics(user.id);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get support ticket by ID' })
  @ApiResponse({ status: 200, description: 'Support ticket retrieved successfully' })
  async findTicketById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.findTicketById(id, user.id);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update support ticket' })
  @ApiResponse({ status: 200, description: 'Support ticket updated successfully' })
  async updateTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateSupportTicketDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.updateTicket(id, updateTicketDto, user.id);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete support ticket' })
  @ApiResponse({ status: 200, description: 'Support ticket deleted successfully' })
  async deleteTicket(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.deleteTicket(id, user.id);
  }

  // Ticket Actions
  @Post('tickets/:id/assign')
  @ApiOperation({ summary: 'Assign ticket to user' })
  @ApiResponse({ status: 200, description: 'Ticket assigned successfully' })
  async assignTicket(
    @Param('id') id: string,
    @Body('assignedToId') assignedToId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.assignTicket(id, assignedToId, user.id);
  }

  @Post('tickets/:id/status')
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  async updateTicketStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.updateTicketStatus(id, status, user.id);
  }

  // Ticket Replies
  @Post('tickets/:id/replies')
  @ApiOperation({ summary: 'Create ticket reply' })
  @ApiResponse({ status: 201, description: 'Ticket reply created successfully' })
  async createTicketReply(
    @Param('id') ticketId: string,
    @Body() createReplyDto: CreateTicketReplyDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.createTicketReply(ticketId, createReplyDto, user.id);
  }

  @Get('tickets/:id/replies')
  @ApiOperation({ summary: 'Get all ticket replies' })
  @ApiResponse({ status: 200, description: 'Ticket replies retrieved successfully' })
  async findAllTicketReplies(
    @Param('id') ticketId: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.findAllTicketReplies(ticketId, user.id);
  }

  @Get('replies/:id')
  @ApiOperation({ summary: 'Get ticket reply by ID' })
  @ApiResponse({ status: 200, description: 'Ticket reply retrieved successfully' })
  async findTicketReplyById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.findTicketReplyById(id, user.id);
  }

  @Patch('replies/:id')
  @ApiOperation({ summary: 'Update ticket reply' })
  @ApiResponse({ status: 200, description: 'Ticket reply updated successfully' })
  async updateTicketReply(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.updateTicketReply(id, content, user.id);
  }

  @Delete('replies/:id')
  @ApiOperation({ summary: 'Delete ticket reply' })
  @ApiResponse({ status: 200, description: 'Ticket reply deleted successfully' })
  async deleteTicketReply(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.deleteTicketReply(id, user.id);
  }

  // Knowledge Base
  @Post('knowledge-base')
  @ApiOperation({ summary: 'Create knowledge base article' })
  @ApiResponse({ status: 201, description: 'Knowledge base article created successfully' })
  async createKnowledgeBaseArticle(
    @Body() createArticleDto: CreateKnowledgeBaseDto,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.createKnowledgeBaseArticle(createArticleDto, user.id);
  }

  @Get('knowledge-base')
  @ApiOperation({ summary: 'Get all knowledge base articles' })
  @ApiResponse({ status: 200, description: 'Knowledge base articles retrieved successfully' })
  async findAllKnowledgeBaseArticles(
    @CurrentUser() user: UserResponseDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isPublished') isPublished?: string,
  ) {
    return this.supportService.findAllKnowledgeBaseArticles(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      category,
      isPublished === 'true',
    );
  }

  @Get('knowledge-base/:id')
  @ApiOperation({ summary: 'Get knowledge base article by ID' })
  @ApiResponse({ status: 200, description: 'Knowledge base article retrieved successfully' })
  async findKnowledgeBaseArticleById(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.findKnowledgeBaseArticleById(id, user.id);
  }

  @Patch('knowledge-base/:id')
  @ApiOperation({ summary: 'Update knowledge base article' })
  @ApiResponse({ status: 200, description: 'Knowledge base article updated successfully' })
  async updateKnowledgeBaseArticle(
    @Param('id') id: string,
    @Body() updateArticleDto: Partial<CreateKnowledgeBaseDto>,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.updateKnowledgeBaseArticle(id, updateArticleDto, user.id);
  }

  @Delete('knowledge-base/:id')
  @ApiOperation({ summary: 'Delete knowledge base article' })
  @ApiResponse({ status: 200, description: 'Knowledge base article deleted successfully' })
  async deleteKnowledgeBaseArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.deleteKnowledgeBaseArticle(id, user.id);
  }

  // Knowledge Base Actions
  @Post('knowledge-base/:id/publish')
  @ApiOperation({ summary: 'Publish knowledge base article' })
  @ApiResponse({ status: 200, description: 'Knowledge base article published successfully' })
  async publishKnowledgeBaseArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.publishKnowledgeBaseArticle(id, user.id);
  }

  @Post('knowledge-base/:id/unpublish')
  @ApiOperation({ summary: 'Unpublish knowledge base article' })
  @ApiResponse({ status: 200, description: 'Knowledge base article unpublished successfully' })
  async unpublishKnowledgeBaseArticle(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.unpublishKnowledgeBaseArticle(id, user.id);
  }

  @Post('knowledge-base/:id/view')
  @ApiOperation({ summary: 'Increment article view count' })
  @ApiResponse({ status: 200, description: 'View count incremented successfully' })
  async incrementViewCount(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.incrementViewCount(id, user.id);
  }

  @Post('knowledge-base/:id/helpful')
  @ApiOperation({ summary: 'Mark article as helpful' })
  @ApiResponse({ status: 200, description: 'Article marked as helpful' })
  async markArticleAsHelpful(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.markArticleAsHelpful(id, user.id);
  }

  @Post('knowledge-base/:id/not-helpful')
  @ApiOperation({ summary: 'Mark article as not helpful' })
  @ApiResponse({ status: 200, description: 'Article marked as not helpful' })
  async markArticleAsNotHelpful(
    @Param('id') id: string,
    @CurrentUser() user: UserResponseDto,
  ) {
    return this.supportService.markArticleAsNotHelpful(id, user.id);
  }
}
