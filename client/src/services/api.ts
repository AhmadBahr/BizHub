import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API response type - backend returns data directly
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Since backend returns data directly, we'll wrap it
export interface BackendResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// For backward compatibility - direct data access
export type ApiResponseData<T> = T;

// Pagination type
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Generic API methods
export const apiService = {
  // GET request
  get: async <T>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await api.get(url, { params });
    // Backend returns data directly, so we wrap it
    return {
      data: response.data,
      success: true,
      message: 'Success'
    };
  },

  // GET request that returns data directly (for Redux compatibility)
  getData: async <T>(url: string, params?: any): Promise<T> => {
    const response = await api.get(url, { params });
    return response.data;
  },

  // POST request
  post: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.post(url, data);
    return {
      data: response.data,
      success: true,
      message: 'Success'
    };
  },

  // POST request that returns data directly (for Redux compatibility)
  postData: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.post(url, data);
    return response.data;
  },

  // PUT request
  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.put(url, data);
    return {
      data: response.data,
      success: true,
      message: 'Success'
    };
  },

  // PUT request that returns data directly (for Redux compatibility)
  putData: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.put(url, data);
    return response.data;
  },

  // PATCH request
  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await api.patch(url, data);
    return {
      data: response.data,
      success: true,
      message: 'Success'
    };
  },

  // PATCH request that returns data directly (for Redux compatibility)
  patchData: async <T>(url: string, data?: any): Promise<T> => {
    const response = await api.patch(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    const response = await api.delete(url);
    return {
      data: response.data,
      success: true,
      message: 'Success'
    };
  },

  // DELETE request that returns data directly (for Redux compatibility)
  deleteData: async <T>(url: string): Promise<T> => {
    const response = await api.delete(url);
    return response.data;
  },
};

export default api;
