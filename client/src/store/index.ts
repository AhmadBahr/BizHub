import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import leadsReducer from './slices/leadsSlice';
import dealsReducer from './slices/dealsSlice';
import dashboardReducer from './slices/dashboardSlice';
import tasksReducer from './slices/tasksSlice';
import integrationsReducer from './slices/integrationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    leads: leadsReducer,
    deals: dealsReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
    integrations: integrationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

