// Export all API services
export { default as api, apiService } from './api';
export * from './quotesApi';
export * from './invoicesApi';
export * from './supportApi';
export * from './contactsApi';

// Re-export types for convenience
export type { ApiResponse, PaginationParams } from './api';
