import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import leadsReducer from './slices/leadsSlice';
import dealsReducer from './slices/dealsSlice';
import dashboardReducer from './slices/dashboardSlice';
import tasksReducer from './slices/tasksSlice';
import integrationsReducer from './slices/integrationsSlice';
import invoicesReducer from './slices/invoicesSlice';
import quotesReducer from './slices/quotesSlice';
import supportReducer from './slices/supportSlice';
import usersReducer from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    contacts: contactsReducer,
    leads: leadsReducer,
    deals: dealsReducer,
    dashboard: dashboardReducer,
    tasks: tasksReducer,
    integrations: integrationsReducer,
    invoices: invoicesReducer,
    quotes: quotesReducer,
    support: supportReducer,
    users: usersReducer,
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

