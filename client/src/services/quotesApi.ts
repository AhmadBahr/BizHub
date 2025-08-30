import { apiService, type PaginationParams } from './api';
import type { Quote, QuoteTemplate, QuoteLineItem } from '../types';

// Quotes API Service
export const quotesApi = {
  // Get all quotes with pagination and filters
  getQuotes: async (params?: PaginationParams & {
    status?: string;
    priority?: string;
    contactId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return apiService.get<Quote[]>('/quotes', params);
  },

  // Get a single quote by ID
  getQuote: async (id: string) => {
    return apiService.get<Quote>(`/quotes/${id}`);
  },

  // Create a new quote
  createQuote: async (quoteData: Partial<Quote>) => {
    return apiService.post<Quote>('/quotes', quoteData);
  },

  // Update an existing quote
  updateQuote: async (id: string, quoteData: Partial<Quote>) => {
    return apiService.put<Quote>(`/quotes/${id}`, quoteData);
  },

  // Delete a quote
  deleteQuote: async (id: string) => {
    return apiService.delete(`/quotes/${id}`);
  },

  // Send a quote (change status to SENT)
  sendQuote: async (id: string) => {
    return apiService.patch<Quote>(`/quotes/${id}/send`);
  },

  // Accept a quote (change status to ACCEPTED)
  acceptQuote: async (id: string) => {
    return apiService.patch<Quote>(`/quotes/${id}/accept`);
  },

  // Reject a quote (change status to REJECTED)
  rejectQuote: async (id: string, reason?: string) => {
    return apiService.patch<Quote>(`/quotes/${id}/reject`, { reason });
  },

  // Get quote analytics
  getQuoteAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/quotes/analytics', params);
  },

  // Get quotes by status
  getQuotesByStatus: async () => {
    return apiService.get('/quotes/by-status');
  },

  // Get quotes by contact
  getQuotesByContact: async (contactId: string) => {
    return apiService.get<Quote[]>(`/quotes/by-contact/${contactId}`);
  },

  // Convert quote to invoice
  convertToInvoice: async (id: string) => {
    return apiService.post(`/quotes/${id}/convert-to-invoice`);
  },
};

// Quote Templates API Service
export const quoteTemplatesApi = {
  // Get all templates
  getTemplates: async (params?: PaginationParams) => {
    return apiService.get<QuoteTemplate[]>('/quotes/templates', params);
  },

  // Get a single template by ID
  getTemplate: async (id: string) => {
    return apiService.get<QuoteTemplate>(`/quotes/templates/${id}`);
  },

  // Create a new template
  createTemplate: async (templateData: Partial<QuoteTemplate>) => {
    return apiService.post<QuoteTemplate>('/quotes/templates', templateData);
  },

  // Update an existing template
  updateTemplate: async (id: string, templateData: Partial<QuoteTemplate>) => {
    return apiService.put<QuoteTemplate>(`/quotes/templates/${id}`, templateData);
  },

  // Delete a template
  deleteTemplate: async (id: string) => {
    return apiService.delete(`/quotes/templates/${id}`);
  },

  // Create quote from template
  createFromTemplate: async (templateId: string, quoteData: Partial<Quote>) => {
    return apiService.post<Quote>(`/quotes/templates/${templateId}/create-quote`, quoteData);
  },
};

// Quote Line Items API Service
export const quoteLineItemsApi = {
  // Get line items for a quote
  getLineItems: async (quoteId: string) => {
    return apiService.get<QuoteLineItem[]>(`/quotes/${quoteId}/line-items`);
  },

  // Add line item to quote
  addLineItem: async (quoteId: string, lineItemData: Partial<QuoteLineItem>) => {
    return apiService.post<QuoteLineItem>(`/quotes/${quoteId}/line-items`, lineItemData);
  },

  // Update line item
  updateLineItem: async (quoteId: string, lineItemId: string, lineItemData: Partial<QuoteLineItem>) => {
    return apiService.put<QuoteLineItem>(`/quotes/${quoteId}/line-items/${lineItemId}`, lineItemData);
  },

  // Delete line item
  deleteLineItem: async (quoteId: string, lineItemId: string) => {
    return apiService.delete(`/quotes/${quoteId}/line-items/${lineItemId}`);
  },

  // Bulk update line items
  bulkUpdateLineItems: async (quoteId: string, lineItems: Partial<QuoteLineItem>[]) => {
    return apiService.put(`/quotes/${quoteId}/line-items/bulk`, { lineItems });
  },
};
