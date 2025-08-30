import { apiService, type PaginationParams } from './api';
import type { Invoice, Payment, InvoiceLineItem, RecurringConfig } from '../types';

// Invoices API Service
export const invoicesApi = {
  // Get all invoices with pagination and filters
  getInvoices: async (params?: PaginationParams & {
    status?: string;
    contactId?: string;
    dateFrom?: string;
    dateTo?: string;
    overdue?: boolean;
  }) => {
    return apiService.get<Invoice[]>('/invoices', params);
  },

  // Get a single invoice by ID
  getInvoice: async (id: string) => {
    return apiService.get<Invoice>(`/invoices/${id}`);
  },

  // Create a new invoice
  createInvoice: async (invoiceData: Partial<Invoice>) => {
    return apiService.post<Invoice>('/invoices', invoiceData);
  },

  // Update an existing invoice
  updateInvoice: async (id: string, invoiceData: Partial<Invoice>) => {
    return apiService.put<Invoice>(`/invoices/${id}`, invoiceData);
  },

  // Delete an invoice
  deleteInvoice: async (id: string) => {
    return apiService.delete(`/invoices/${id}`);
  },

  // Send an invoice (change status to SENT)
  sendInvoice: async (id: string) => {
    return apiService.patch<Invoice>(`/invoices/${id}/send`);
  },

  // Mark invoice as paid
  markAsPaid: async (id: string, paymentData?: Partial<Payment>) => {
    return apiService.patch<Invoice>(`/invoices/${id}/mark-paid`, paymentData);
  },

  // Mark invoice as overdue
  markAsOverdue: async (id: string) => {
    return apiService.patch<Invoice>(`/invoices/${id}/mark-overdue`);
  },

  // Cancel an invoice
  cancelInvoice: async (id: string, reason?: string) => {
    return apiService.patch<Invoice>(`/invoices/${id}/cancel`, { reason });
  },

  // Get invoice analytics
  getInvoiceAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/invoices/analytics', params);
  },

  // Get overdue invoices
  getOverdueInvoices: async () => {
    return apiService.get<Invoice[]>('/invoices/overdue');
  },

  // Get invoices by status
  getInvoicesByStatus: async () => {
    return apiService.get('/invoices/by-status');
  },

  // Get invoices by contact
  getInvoicesByContact: async (contactId: string) => {
    return apiService.get<Invoice[]>(`/invoices/by-contact/${contactId}`);
  },

  // Generate invoice PDF
  generatePDF: async (id: string) => {
    return apiService.get(`/invoices/${id}/pdf`);
  },

  // Send invoice reminder
  sendReminder: async (id: string) => {
    return apiService.post(`/invoices/${id}/send-reminder`);
  },
};

// Payments API Service
export const paymentsApi = {
  // Get all payments
  getPayments: async (params?: PaginationParams & {
    invoiceId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return apiService.get<Payment[]>('/payments', params);
  },

  // Get a single payment by ID
  getPayment: async (id: string) => {
    return apiService.get<Payment>(`/payments/${id}`);
  },

  // Create a new payment
  createPayment: async (paymentData: Partial<Payment>) => {
    return apiService.post<Payment>('/payments', paymentData);
  },

  // Update an existing payment
  updatePayment: async (id: string, paymentData: Partial<Payment>) => {
    return apiService.put<Payment>(`/payments/${id}`, paymentData);
  },

  // Delete a payment
  deletePayment: async (id: string) => {
    return apiService.delete(`/payments/${id}`);
  },

  // Get payments by invoice
  getPaymentsByInvoice: async (invoiceId: string) => {
    return apiService.get<Payment[]>(`/payments/by-invoice/${invoiceId}`);
  },

  // Get payment analytics
  getPaymentAnalytics: async (params?: {
    dateFrom?: string;
    dateTo?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) => {
    return apiService.get('/payments/analytics', params);
  },

  // Process payment
  processPayment: async (paymentData: Partial<Payment>) => {
    return apiService.post<Payment>('/payments/process', paymentData);
  },

  // Refund payment
  refundPayment: async (id: string, amount?: number, reason?: string) => {
    return apiService.post(`/payments/${id}/refund`, { amount, reason });
  },
};

// Invoice Line Items API Service
export const invoiceLineItemsApi = {
  // Get line items for an invoice
  getLineItems: async (invoiceId: string) => {
    return apiService.get<InvoiceLineItem[]>(`/invoices/${invoiceId}/line-items`);
  },

  // Add line item to invoice
  addLineItem: async (invoiceId: string, lineItemData: Partial<InvoiceLineItem>) => {
    return apiService.post<InvoiceLineItem>(`/invoices/${invoiceId}/line-items`, lineItemData);
  },

  // Update line item
  updateLineItem: async (invoiceId: string, lineItemId: string, lineItemData: Partial<InvoiceLineItem>) => {
    return apiService.put<InvoiceLineItem>(`/invoices/${invoiceId}/line-items/${lineItemId}`, lineItemData);
  },

  // Delete line item
  deleteLineItem: async (invoiceId: string, lineItemId: string) => {
    return apiService.delete(`/invoices/${invoiceId}/line-items/${lineItemId}`);
  },

  // Bulk update line items
  bulkUpdateLineItems: async (invoiceId: string, lineItems: Partial<InvoiceLineItem>[]) => {
    return apiService.put(`/invoices/${invoiceId}/line-items/bulk`, { lineItems });
  },
};

// Recurring Invoices API Service
export const recurringInvoicesApi = {
  // Get all recurring invoices
  getRecurringInvoices: async (params?: PaginationParams) => {
    return apiService.get<Invoice[]>('/invoices/recurring', params);
  },

  // Create recurring invoice
  createRecurringInvoice: async (invoiceData: Partial<Invoice>, recurringConfig: RecurringConfig) => {
    return apiService.post<Invoice>('/invoices/recurring', { ...invoiceData, recurringConfig });
  },

  // Update recurring invoice
  updateRecurringInvoice: async (id: string, invoiceData: Partial<Invoice>, recurringConfig?: RecurringConfig) => {
    return apiService.put<Invoice>(`/invoices/recurring/${id}`, { ...invoiceData, recurringConfig });
  },

  // Pause recurring invoice
  pauseRecurringInvoice: async (id: string) => {
    return apiService.patch<Invoice>(`/invoices/recurring/${id}/pause`);
  },

  // Resume recurring invoice
  resumeRecurringInvoice: async (id: string) => {
    return apiService.patch<Invoice>(`/invoices/recurring/${id}/resume`);
  },

  // Cancel recurring invoice
  cancelRecurringInvoice: async (id: string) => {
    return apiService.patch<Invoice>(`/invoices/recurring/${id}/cancel`);
  },

  // Get next occurrence date
  getNextOccurrence: async (id: string) => {
    return apiService.get(`/invoices/recurring/${id}/next-occurrence`);
  },
};
