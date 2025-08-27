import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { DashboardMetrics, Activity, Deal } from '../../types';
import { apiService } from '../../services/api';

interface DashboardState {
  metrics: DashboardMetrics | null;
  recentActivities: Activity[];
  topDeals: Deal[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  recentActivities: [],
  topDeals: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<DashboardMetrics>('/dashboard/metrics');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Activity[]>('/dashboard/activities/recent');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

export const fetchTopDeals = createAsyncThunk(
  'dashboard/fetchTopDeals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get<Deal[]>('/dashboard/top-deals');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top deals');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch recent activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities = action.payload;
      })
      // Fetch top deals
      .addCase(fetchTopDeals.fulfilled, (state, action) => {
        state.topDeals = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
