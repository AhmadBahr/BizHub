export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  title: string;
  description?: string;
  status: string;
  source: string;
  score: number;
  value: number;
  expectedCloseDate: Date;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  contactId: string;
  assignedToId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Deal {
  id: string;
  title: string;
  description?: string;
  value: number;
  status: string;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  contactId: string;
  leadId?: string;
  assignedToId?: string;
  tags: string[];
  notes?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    company?: string;
  };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate: Date;
  estimatedHours: number;
  actualHours?: number;
  progress: number;
  category: string;
  tags: string[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: string;
  relatedToId?: string;
  relatedToType?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  status: string;
  features: string[];
  setupSteps: string[];
  apiKey?: string;
  isActive: boolean;
  lastTested?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  description?: string;
  duration: number;
  scheduledAt: Date;
  completedAt: Date;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  leadId?: string;
  dealId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
  lead?: {
    id: string;
    title: string;
  };
  deal?: {
    id: string;
    title: string;
  };
}

export interface DashboardMetrics {
  overview: {
    totalContacts: number;
    totalLeads: number;
    totalDeals: number;
    totalTasks: number;
    totalActivities: number;
    activeLeads: number;
    activeDeals: number;
    pendingTasks: number;
    completedTasks: number;
    taskCompletionRate: number;
  };
  revenue: {
    totalValue: number;
    wonValue: number;
    pipelineValue: number;
    winRate: number;
    monthlyRevenue: Array<{
      month: Date;
      revenue: number;
    }>;
  };
  leadSourceStats: Array<{
    source: string;
    count: number;
  }>;
  leadStatusStats: Array<{
    status: string;
    count: number;
  }>;
  dealStatusStats: Array<{
    status: string;
    count: number;
    value: number;
  }>;
  recentActivities: Activity[];
  upcomingTasks: Task[];
  topDeals: Deal[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
