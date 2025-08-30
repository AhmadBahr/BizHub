import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Lead } from '../../types';
import { apiService } from '../../services/api';

interface FetchLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  source?: string;
}

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  searchTerm: string;
  statusFilter: string;
  sourceFilter: string;
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  searchTerm: '',
  statusFilter: '',
  sourceFilter: '',
};

// Async thunks
export const fetchLeads = createAsyncThunk(
  'leads/fetchLeads',
  async ({ page = 1, limit = 10, search = '', status, source }: FetchLeadsParams, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (source) params.append('source', source);
      
      const response = await apiService.getData<{ leads: Lead[]; total: number; page: number; limit: number }>(`/leads?${params.toString()}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads');
    }
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchLeadById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<Lead>(`/leads/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch lead');
    }
  }
);

export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData: Partial<Lead>, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<Lead>('/leads', leadData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create lead');
    }
  }
);

export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, data }: { id: string; data: Partial<Lead> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putData<Lead>(`/leads/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead');
    }
  }
);

export const deleteLead = createAsyncThunk(
  'leads/deleteLead',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/leads/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete lead');
    }
  }
);

export const updateLeadScore = createAsyncThunk(
  'leads/updateLeadScore',
  async ({ id, score }: { id: string; score: number }, { rejectWithValue }) => {
    try {
      const response = await apiService.patchData<Lead>(`/leads/${id}/score`, { score });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update lead score');
    }
  }
);

const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSourceFilter: (state, action: PayloadAction<string>) => {
      state.sourceFilter = action.payload;
    },
    setSelectedLead: (state, action: PayloadAction<Lead | null>) => {
      state.selectedLead = action.payload;
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
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
      // Fetch leads
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leads = action.payload.leads;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch lead by ID
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.selectedLead = action.payload;
      })
      // Create lead
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
        state.total += 1;
      })
      // Update lead
      .addCase(updateLead.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.selectedLead?.id === action.payload.id) {
          state.selectedLead = action.payload;
        }
      })
      // Delete lead
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter(lead => lead.id !== action.payload);
        state.total -= 1;
        if (state.selectedLead?.id === action.payload) {
          state.selectedLead = null;
        }
      })
      // Update lead score
      .addCase(updateLeadScore.fulfilled, (state, action) => {
        const index = state.leads.findIndex(lead => lead.id === action.payload.id);
        if (index !== -1) {
          state.leads[index] = action.payload;
        }
        if (state.selectedLead?.id === action.payload.id) {
          state.selectedLead = action.payload;
        }
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setSourceFilter,
  setSelectedLead,
  clearSelectedLead,
  clearError,
  setPage,
  setLimit,
} = leadsSlice.actions;

export default leadsSlice.reducer;
