import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Integration } from '../../types';
import { apiService } from '../../services/api';

interface IntegrationsState {
  integrations: Integration[];
  selectedIntegration: Integration | null;
  isLoading: boolean;
  error: string | null;
  activeIntegrations: string[];
}

const initialState: IntegrationsState = {
  integrations: [],
  selectedIntegration: null,
  isLoading: false,
  error: null,
  activeIntegrations: [],
};

// Async thunks
export const fetchIntegrations = createAsyncThunk(
  'integrations/fetchIntegrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<Integration[]>('/integrations');
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch integrations');
    }
  }
);

export const fetchIntegrationById = createAsyncThunk(
  'integrations/fetchIntegrationById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getData<Integration>(`/integrations/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch integration');
    }
  }
);

export const createIntegration = createAsyncThunk(
  'integrations/createIntegration',
  async (integrationData: Partial<Integration>, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<Integration>('/integrations', integrationData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create integration');
    }
  }
);

export const updateIntegration = createAsyncThunk(
  'integrations/updateIntegration',
  async ({ id, data }: { id: string; data: Partial<Integration> }, { rejectWithValue }) => {
    try {
      const response = await apiService.putData<Integration>(`/integrations/${id}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update integration');
    }
  }
);

export const deleteIntegration = createAsyncThunk(
  'integrations/deleteIntegration',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiService.delete(`/integrations/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete integration');
    }
  }
);

export const toggleIntegration = createAsyncThunk(
  'integrations/toggleIntegration',
  async ({ id, isActive }: { id: string; isActive: boolean }, { rejectWithValue }) => {
    try {
      const response = await apiService.patchData<Integration>(`/integrations/${id}/toggle`, { isActive });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle integration');
    }
  }
);

export const testIntegration = createAsyncThunk(
  'integrations/testIntegration',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiService.postData<{ success: boolean; message: string }>(`/integrations/${id}/test`);
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to test integration');
    }
  }
);

const integrationsSlice = createSlice({
  name: 'integrations',
  initialState,
  reducers: {
    setSelectedIntegration: (state, action: PayloadAction<Integration | null>) => {
      state.selectedIntegration = action.payload;
    },
    clearSelectedIntegration: (state) => {
      state.selectedIntegration = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setActiveIntegrations: (state, action: PayloadAction<string[]>) => {
      state.activeIntegrations = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch integrations
      .addCase(fetchIntegrations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIntegrations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.integrations = action.payload;
        state.activeIntegrations = action.payload
          .filter(integration => integration.isActive)
          .map(integration => integration.id);
      })
      .addCase(fetchIntegrations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch integration by ID
      .addCase(fetchIntegrationById.fulfilled, (state, action) => {
        state.selectedIntegration = action.payload;
      })
      // Create integration
      .addCase(createIntegration.fulfilled, (state, action) => {
        state.integrations.push(action.payload);
        if (action.payload.isActive) {
          state.activeIntegrations.push(action.payload.id);
        }
      })
      // Update integration
      .addCase(updateIntegration.fulfilled, (state, action) => {
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = action.payload;
        }
        if (state.selectedIntegration?.id === action.payload.id) {
          state.selectedIntegration = action.payload;
        }
        // Update active integrations list
        if (action.payload.isActive && !state.activeIntegrations.includes(action.payload.id)) {
          state.activeIntegrations.push(action.payload.id);
        } else if (!action.payload.isActive) {
          state.activeIntegrations = state.activeIntegrations.filter(id => id !== action.payload.id);
        }
      })
      // Delete integration
      .addCase(deleteIntegration.fulfilled, (state, action) => {
        state.integrations = state.integrations.filter(integration => integration.id !== action.payload);
        state.activeIntegrations = state.activeIntegrations.filter(id => id !== action.payload);
        if (state.selectedIntegration?.id === action.payload) {
          state.selectedIntegration = null;
        }
      })
      // Toggle integration
      .addCase(toggleIntegration.fulfilled, (state, action) => {
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = action.payload;
        }
        if (state.selectedIntegration?.id === action.payload.id) {
          state.selectedIntegration = action.payload;
        }
        // Update active integrations list
        if (action.payload.isActive && !state.activeIntegrations.includes(action.payload.id)) {
          state.activeIntegrations.push(action.payload.id);
        } else if (!action.payload.isActive) {
          state.activeIntegrations = state.activeIntegrations.filter(id => id !== action.payload.id);
        }
      })
      // Test integration
      .addCase(testIntegration.fulfilled, (state, action) => {
        // Update the integration's lastTested timestamp if needed
        const index = state.integrations.findIndex(integration => integration.id === action.payload.id);
        if (index !== -1) {
          state.integrations[index] = {
            ...state.integrations[index],
            lastTested: new Date(),
          };
        }
      });
  },
});

export const {
  setSelectedIntegration,
  clearSelectedIntegration,
  clearError,
  setActiveIntegrations,
} = integrationsSlice.actions;

export default integrationsSlice.reducer;
