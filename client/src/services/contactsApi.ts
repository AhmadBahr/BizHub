import { apiService, type PaginationParams } from './api';
import type { Contact, User } from '../types';

// Contacts API Service
export const contactsApi = {
  // Get all contacts with pagination and filters
  getContacts: async (params?: PaginationParams & {
    status?: string;
    tags?: string[];
    isActive?: boolean;
    search?: string;
  }) => {
    return apiService.get<Contact[]>('/contacts', params);
  },

  // Get a single contact by ID
  getContact: async (id: string) => {
    return apiService.get<Contact>(`/contacts/${id}`);
  },

  // Create a new contact
  createContact: async (contactData: Partial<Contact>) => {
    return apiService.post<Contact>('/contacts', contactData);
  },

  // Update an existing contact
  updateContact: async (id: string, contactData: Partial<Contact>) => {
    return apiService.put<Contact>(`/contacts/${id}`, contactData);
  },

  // Delete a contact
  deleteContact: async (id: string) => {
    return apiService.delete(`/contacts/${id}`);
  },

  // Search contacts
  searchContacts: async (query: string) => {
    return apiService.get<Contact[]>('/contacts/search', { q: query });
  },

  // Get contacts by tag
  getContactsByTag: async (tag: string) => {
    return apiService.get<Contact[]>(`/contacts/tag/${tag}`);
  },

  // Get active contacts
  getActiveContacts: async () => {
    return apiService.get<Contact[]>('/contacts/active');
  },

  // Bulk update contacts
  bulkUpdateContacts: async (contactIds: string[], updates: Partial<Contact>) => {
    return apiService.patch('/contacts/bulk-update', { contactIds, updates });
  },

  // Export contacts
  exportContacts: async (params?: {
    format?: 'csv' | 'excel' | 'pdf';
    status?: string;
    tags?: string[];
  }) => {
    return apiService.get('/contacts/export', params);
  },
};

// Users API Service
export const usersApi = {
  // Get all users with pagination and filters
  getUsers: async (params?: PaginationParams & {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    return apiService.get<User[]>('/users', params);
  },

  // Get a single user by ID
  getUser: async (id: string) => {
    return apiService.get<User>(`/users/${id}`);
  },

  // Get current user profile
  getCurrentUser: async () => {
    return apiService.get<User>('/users/me');
  },

  // Update current user profile
  updateCurrentUser: async (userData: Partial<User>) => {
    return apiService.put<User>('/users/me', userData);
  },

  // Get users by role
  getUsersByRole: async (role: string) => {
    return apiService.get<User[]>(`/users/role/${role}`);
  },

  // Get active users
  getActiveUsers: async () => {
    return apiService.get<User[]>('/users/active');
  },

  // Search users
  searchUsers: async (query: string) => {
    return apiService.get<User[]>('/users/search', { q: query });
  },
};
