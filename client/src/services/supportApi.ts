import { apiService, type PaginationParams } from './api';
import type { SupportTicket, TicketReply, KnowledgeBase } from '../types';

// Support Tickets API Service
export const supportTicketsApi = {
  // Get all tickets with pagination and filters
  getTickets: async (params?: PaginationParams & {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    contactId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return apiService.get<SupportTicket[]>('/support/tickets', params);
  },

  // Get a single ticket by ID
  getTicket: async (id: string) => {
    return apiService.get<SupportTicket>(`/support/tickets/${id}`);
  },

  // Create a new ticket
  createTicket: async (ticketData: Partial<SupportTicket>) => {
    return apiService.post<SupportTicket>('/support/tickets', ticketData);
  },

  // Update an existing ticket
  updateTicket: async (id: string, ticketData: Partial<SupportTicket>) => {
    return apiService.put<SupportTicket>(`/support/tickets/${id}`, ticketData);
  },

  // Delete a ticket
  deleteTicket: async (id: string) => {
    return apiService.delete(`/support/tickets/${id}`);
  },

  // Assign ticket to user
  assignTicket: async (id: string, userId: string) => {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}/assign`, { userId });
  },

  // Change ticket status
  changeStatus: async (id: string, status: string) => {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}/status`, { status });
  },

  // Change ticket priority
  changePriority: async (id: string, priority: string) => {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}/priority`, { priority });
  },

  // Resolve ticket
  resolveTicket: async (id: string, resolution?: string) => {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}/resolve`, { resolution });
  },

  // Close ticket
  closeTicket: async (id: string) => {
    return apiService.patch<SupportTicket>(`/support/tickets/${id}/close`);
  },

  // Get ticket analytics
  getTicketAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/tickets/analytics', params);
  },

  // Get tickets by status
  getTicketsByStatus: async () => {
    return apiService.get('/support/tickets/by-status');
  },

  // Get tickets by priority
  getTicketsByPriority: async () => {
    return apiService.get('/support/tickets/by-priority');
  },

  // Get tickets by category
  getTicketsByCategory: async () => {
    return apiService.get('/support/tickets/by-category');
  },

  // Get tickets by assigned user
  getTicketsByUser: async (userId: string) => {
    return apiService.get<SupportTicket[]>(`/support/tickets/by-user/${userId}`);
  },

  // Get tickets by contact
  getTicketsByContact: async (contactId: string) => {
    return apiService.get<SupportTicket[]>(`/support/tickets/by-contact/${contactId}`);
  },

  // Search tickets
  searchTickets: async (query: string) => {
    return apiService.get<SupportTicket[]>('/support/tickets/search', { q: query });
  },

  // Bulk update tickets
  bulkUpdateTickets: async (ticketIds: string[], updates: Partial<SupportTicket>) => {
    return apiService.patch('/support/tickets/bulk-update', { ticketIds, updates });
  },

  // Export tickets
  exportTickets: async (params?: {
    format?: 'csv' | 'excel' | 'pdf';
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }) => {
    return apiService.get('/support/tickets/export', params);
  },
};

// Ticket Replies API Service
export const ticketRepliesApi = {
  // Get replies for a ticket
  getReplies: async (ticketId: string) => {
    return apiService.get<TicketReply[]>(`/support/tickets/${ticketId}/replies`);
  },

  // Get a single reply by ID
  getReply: async (ticketId: string, replyId: string) => {
    return apiService.get<TicketReply>(`/support/tickets/${ticketId}/replies/${replyId}`);
  },

  // Add reply to ticket
  addReply: async (ticketId: string, replyData: Partial<TicketReply>) => {
    return apiService.post<TicketReply>(`/support/tickets/${ticketId}/replies`, replyData);
  },

  // Update reply
  updateReply: async (ticketId: string, replyId: string, replyData: Partial<TicketReply>) => {
    return apiService.put<TicketReply>(`/support/tickets/${ticketId}/replies/${replyId}`, replyData);
  },

  // Delete reply
  deleteReply: async (ticketId: string, replyId: string) => {
    return apiService.delete(`/support/tickets/${ticketId}/replies/${replyId}`);
  },

  // Mark reply as internal note
  markAsInternal: async (ticketId: string, replyId: string) => {
    return apiService.patch<TicketReply>(`/support/tickets/${ticketId}/replies/${replyId}/internal`);
  },

  // Get internal notes for a ticket
  getInternalNotes: async (ticketId: string) => {
    return apiService.get<TicketReply[]>(`/support/tickets/${ticketId}/replies/internal`);
  },
};

// Knowledge Base API Service
export const knowledgeBaseApi = {
  // Get all knowledge base articles with pagination and filters
  getArticles: async (params?: PaginationParams & {
    category?: string;
    tags?: string[];
    isPublished?: boolean;
    search?: string;
  }) => {
    return apiService.get<KnowledgeBase[]>('/support/knowledge-base', params);
  },

  // Get a single article by ID
  getArticle: async (id: string) => {
    return apiService.get<KnowledgeBase>(`/support/knowledge-base/${id}`);
  },

  // Create a new article
  createArticle: async (articleData: Partial<KnowledgeBase>) => {
    return apiService.post<KnowledgeBase>('/support/knowledge-base', articleData);
  },

  // Update an existing article
  updateArticle: async (id: string, articleData: Partial<KnowledgeBase>) => {
    return apiService.put<KnowledgeBase>(`/support/knowledge-base/${id}`, articleData);
  },

  // Delete an article
  deleteArticle: async (id: string) => {
    return apiService.delete(`/support/knowledge-base/${id}`);
  },

  // Publish article
  publishArticle: async (id: string) => {
    return apiService.patch<KnowledgeBase>(`/support/knowledge-base/${id}/publish`);
  },

  // Unpublish article
  unpublishArticle: async (id: string) => {
    return apiService.patch<KnowledgeBase>(`/support/knowledge-base/${id}/unpublish`);
  },

  // Get articles by category
  getArticlesByCategory: async (category: string) => {
    return apiService.get<KnowledgeBase[]>(`/support/knowledge-base/category/${category}`);
  },

  // Get articles by tag
  getArticlesByTag: async (tag: string) => {
    return apiService.get<KnowledgeBase[]>(`/support/knowledge-base/tag/${tag}`);
  },

  // Search articles
  searchArticles: async (query: string) => {
    return apiService.get<KnowledgeBase[]>('/support/knowledge-base/search', { q: query });
  },

  // Get popular articles
  getPopularArticles: async (limit?: number) => {
    return apiService.get<KnowledgeBase[]>('/support/knowledge-base/popular', { limit });
  },

  // Get related articles
  getRelatedArticles: async (articleId: string, limit?: number) => {
    return apiService.get<KnowledgeBase[]>(`/support/knowledge-base/${articleId}/related`, { limit });
  },

  // Add article view (for analytics)
  addArticleView: async (id: string) => {
    return apiService.post(`/support/knowledge-base/${id}/view`);
  },

  // Get article analytics
  getArticleAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/knowledge-base/analytics', params);
  },

  // Get all categories
  getCategories: async () => {
    return apiService.get('/support/knowledge-base/categories');
  },

  // Get all tags
  getTags: async () => {
    return apiService.get('/support/knowledge-base/tags');
  },

  // Bulk update articles
  bulkUpdateArticles: async (articleIds: string[], updates: Partial<KnowledgeBase>) => {
    return apiService.patch('/support/knowledge-base/bulk-update', { articleIds, updates });
  },

  // Export articles
  exportArticles: async (params?: {
    format?: 'csv' | 'excel' | 'pdf';
    category?: string;
    isPublished?: boolean;
  }) => {
    return apiService.get('/support/knowledge-base/export', params);
  },
};

// Support Analytics API Service
export const supportAnalyticsApi = {
  // Get overall support analytics
  getOverallAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return apiService.get('/support/analytics/overall', params);
  },

  // Get response time analytics
  getResponseTimeAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/analytics/response-time', params);
  },

  // Get resolution time analytics
  getResolutionTimeAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/analytics/resolution-time', params);
  },

  // Get customer satisfaction analytics
  getSatisfactionAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/analytics/satisfaction', params);
  },

  // Get agent performance analytics
  getAgentPerformance: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    agentId?: string;
  }) => {
    return apiService.get('/support/analytics/agent-performance', params);
  },

  // Get knowledge base usage analytics
  getKnowledgeBaseUsage: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/support/analytics/knowledge-base-usage', params);
  },
};
