import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Quote } from '../../types';
import { apiService } from '../../services/api';

interface QuotesState {
  quotes: Quote[];
  selectedQuote: Quote | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
  searchTerm: string;
  statusFilter: string;
  dateFilter: string;
}

const initialState: QuotesState = {
  quotes: [],
  selectedQuote: null,
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
  searchTerm: '',
  statusFilter: '',
  dateFilter: '',
};

// Async thunks
export const fetchQuotes = createAsyncThunk(
  'quotes/fetchQuotes',
  async (params: { page?: number; limit?: number; search?: string; status?: string; date?: string }, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<{ quotes: Quote[]; total: number; page: number; limit: number }>('/quotes', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quotes');
    }
  }
);

export const fetchQuoteById = createAsyncThunk(
  'quotes/fetchQuoteById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<Quote>(`/quotes/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch quote');
    }
  }
);

export const createQuote = createAsyncThunk(
  'quotes/createQuote',
  async (quoteData: Partial<Quote>, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<Quote>('/quotes', quoteData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create quote');
    }
  }
);

export const updateQuote = createAsyncThunk(
  'quotes/updateQuote',
  async ({ id, data }: { id: string; data: Partial<Quote> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putData<Quote>(`/quotes/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update quote');
    }
  }
);

export const deleteQuote = createAsyncThunk(
  'quotes/deleteQuote',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/quotes/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete quote');
    }
  }
);

export const sendQuote = createAsyncThunk(
  'quotes/sendQuote',
  async ({ id, emailData }: { id: string; emailData: { to: string; subject?: string; message?: string } }, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<Quote>(`/quotes/${id}/send`, emailData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send quote');
    }
  }
);

const quotesSlice = createSlice({
  name: 'quotes',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.page = 1;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setDateFilter: (state, action: PayloadAction<string>) => {
      state.dateFilter = action.payload;
      state.page = 1;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },
    setSelectedQuote: (state, action: PayloadAction<Quote | null>) => {
      state.selectedQuote = action.payload;
    },
    clearSelectedQuote: (state) => {
      state.selectedQuote = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quotes
      .addCase(fetchQuotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotes = action.payload.quotes;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchQuotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch quote by ID
      .addCase(fetchQuoteById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuoteById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedQuote = action.payload;
      })
      .addCase(fetchQuoteById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create quote
      .addCase(createQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotes.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update quote
      .addCase(updateQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.quotes.findIndex(quote => quote.id === action.payload.id);
        if (index !== -1) {
          state.quotes[index] = action.payload;
        }
        if (state.selectedQuote?.id === action.payload.id) {
          state.selectedQuote = action.payload;
        }
      })
      .addCase(updateQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete quote
      .addCase(deleteQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quotes = state.quotes.filter(quote => quote.id !== action.payload);
        state.total -= 1;
        if (state.selectedQuote?.id === action.payload) {
          state.selectedQuote = null;
        }
      })
      .addCase(deleteQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send quote
      .addCase(sendQuote.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendQuote.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the quote status to SENT
        const index = state.quotes.findIndex(quote => quote.id === action.payload.id);
        if (index !== -1) {
          state.quotes[index] = action.payload;
        }
        if (state.selectedQuote?.id === action.payload.id) {
          state.selectedQuote = action.payload;
        }
      })
      .addCase(sendQuote.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSearchTerm,
  setStatusFilter,
  setDateFilter,
  setPage,
  setLimit,
  setSelectedQuote,
  clearSelectedQuote,
  clearError,
} = quotesSlice.actions;

export default quotesSlice.reducer;
