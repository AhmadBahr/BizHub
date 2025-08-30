import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SupportTicket, KnowledgeBase } from '../../types';
import { apiService } from '../../services/api';

interface SupportState {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  knowledgeBase: KnowledgeBase[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  statusFilter: string;
  priorityFilter: string;
  assignedToFilter: string;
  categoryFilter: string;
}

const initialState: SupportState = {
  tickets: [],
  selectedTicket: null,
  knowledgeBase: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  statusFilter: '',
  priorityFilter: '',
  assignedToFilter: '',
  categoryFilter: '',
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'support/fetchTickets',
  async (params: { page?: number; limit?: number; status?: string; priority?: string; assignedTo?: string; category?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<{ tickets: SupportTicket[]; total: number; page: number; limit: number }>('/support/tickets', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'support/fetchTicketById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<SupportTicket>(`/support/tickets/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket');
    }
  }
);

export const createSupportTicket = createAsyncThunk(
  'support/createSupportTicket',
  async (ticketData: Partial<SupportTicket>, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<SupportTicket>('/support/tickets', ticketData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create ticket');
    }
  }
);

export const updateSupportTicket = createAsyncThunk(
  'support/updateSupportTicket',
  async ({ id, data }: { id: string; data: Partial<SupportTicket> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putData<SupportTicket>(`/support/tickets/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ticket');
    }
  }
);

export const deleteSupportTicket = createAsyncThunk(
  'support/deleteSupportTicket',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/support/tickets/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ticket');
    }
  }
);

export const fetchKnowledgeBase = createAsyncThunk(
  'support/fetchKnowledgeBase',
  async (params: { category?: string; search?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<KnowledgeBase[]>('/support/knowledge-base', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch knowledge base');
    }
  }
);

export const createKnowledgeArticle = createAsyncThunk(
  'support/createKnowledgeArticle',
  async (articleData: Partial<KnowledgeBase>, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<KnowledgeBase>('/support/knowledge-base', articleData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create knowledge article');
    }
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setPriorityFilter: (state, action: PayloadAction<string>) => {
      state.priorityFilter = action.payload;
      state.page = 1;
    },
    setAssignedToFilter: (state, action: PayloadAction<string>) => {
      state.assignedToFilter = action.payload;
      state.page = 1;
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setSelectedTicket: (state, action: PayloadAction<SupportTicket | null>) => {
      state.selectedTicket = action.payload;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = action.payload.tickets;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTicket = action.payload;
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create ticket
      .addCase(createSupportTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update ticket
      .addCase(updateSupportTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        if (state.selectedTicket?.id === action.payload.id) {
          state.selectedTicket = action.payload;
        }
      })
      .addCase(updateSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete ticket
      .addCase(deleteSupportTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSupportTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tickets = state.tickets.filter(ticket => ticket.id !== action.payload);
        state.total -= 1;
        if (state.selectedTicket?.id === action.payload) {
          state.selectedTicket = null;
        }
      })
      .addCase(deleteSupportTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch knowledge base
      .addCase(fetchKnowledgeBase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKnowledgeBase.fulfilled, (state, action) => {
        state.isLoading = false;
        state.knowledgeBase = action.payload;
      })
      .addCase(fetchKnowledgeBase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create knowledge article
      .addCase(createKnowledgeArticle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createKnowledgeArticle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.knowledgeBase.unshift(action.payload);
      })
      .addCase(createKnowledgeArticle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setStatusFilter,
  setPriorityFilter,
  setAssignedToFilter,
  setCategoryFilter,
  setPage,
  setLimit,
  setSelectedTicket,
  clearSelectedTicket,
  clearError,
} = supportSlice.actions;

export default supportSlice.reducer;
