import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Deal } from '../../types';
import { apiService } from '../../services/api';

interface FetchDealsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedTo?: string;
}

interface DealsState {
  deals: Deal[];
  selectedDeal: Deal | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  searchTerm: string;
  statusFilter: string;
  assignedToFilter: string;
}

const initialState: DealsState = {
  deals: [],
  selectedDeal: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  searchTerm: '',
  statusFilter: '',
  assignedToFilter: '',
};

// Async thunks
export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async ({ page = 1, limit = 10, search = '', status, assignedTo }: FetchDealsParams, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (assignedTo) params.append('assignedTo', assignedTo);
      
      const response = await apiService.get<{ deals: Deal[]; total: number; page: number; limit: number }>(`/deals?${params.toString()}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deals');
    }
  }
);

export const fetchDealById = createAsyncThunk(
  'deals/fetchDealById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Deal>(`/deals/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch deal');
    }
  }
);

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (dealData: Partial<Deal>, { rejectWithValue }) => {
    try {
      const response = await apiService.post<Deal>('/deals', dealData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create deal');
    }
  }
);

export const updateDeal = createAsyncThunk(
  'deals/updateDeal',
  async ({ id, data }: { id: string; data: Partial<Deal> }, { rejectWithValue }) => {
    try {
      const response = await apiService.put<Deal>(`/deals/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal');
    }
  }
);

export const deleteDeal = createAsyncThunk(
  'deals/deleteDeal',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/deals/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete deal');
    }
  }
);

export const updateDealStatus = createAsyncThunk(
  'deals/updateDealStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch<Deal>(`/deals/${id}/status`, { status });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal status');
    }
  }
);

export const updateDealProbability = createAsyncThunk(
  'deals/updateDealProbability',
  async ({ id, probability }: { id: string; probability: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch<Deal>(`/deals/${id}/probability`, { probability });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update deal probability');
    }
  }
);

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setAssignedToFilter: (state, action: PayloadAction<string>) => {
      state.assignedToFilter = action.payload;
    },
    setSelectedDeal: (state, action: PayloadAction<Deal | null>) => {
      state.selectedDeal = action.payload;
    },
    clearSelectedDeal: (state) => {
      state.selectedDeal = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch deals
      .addCase(fetchDeals.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.deals = action.payload.deals;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch deal by ID
      .addCase(fetchDealById.fulfilled, (state, action) => {
        state.selectedDeal = action.payload;
      })
      // Create deal
      .addCase(createDeal.fulfilled, (state, action) => {
        state.deals.unshift(action.payload);
        state.total += 1;
      })
      // Update deal
      .addCase(updateDeal.fulfilled, (state, action) => {
        const index = state.deals.findIndex(deal => deal.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        if (state.selectedDeal?.id === action.payload.id) {
          state.selectedDeal = action.payload;
        }
      })
      // Delete deal
      .addCase(deleteDeal.fulfilled, (state, action) => {
        state.deals = state.deals.filter(deal => deal.id !== action.payload);
        state.total -= 1;
        if (state.selectedDeal?.id === action.payload) {
          state.selectedDeal = null;
        }
      })
      // Update deal status
      .addCase(updateDealStatus.fulfilled, (state, action) => {
        const index = state.deals.findIndex(deal => deal.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        if (state.selectedDeal?.id === action.payload.id) {
          state.selectedDeal = action.payload;
        }
      })
      // Update deal probability
      .addCase(updateDealProbability.fulfilled, (state, action) => {
        const index = state.deals.findIndex(deal => deal.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
        if (state.selectedDeal?.id === action.payload.id) {
          state.selectedDeal = action.payload;
        }
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setAssignedToFilter,
  setSelectedDeal,
  clearSelectedDeal,
  clearError,
  setPage,
  setLimit,
} = dealsSlice.actions;

export default dealsSlice.reducer;
