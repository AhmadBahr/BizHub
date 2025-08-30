import React, { useState, useEffect } from 'react';
import type { SupportTicket } from '../../types';
import './SupportAnalytics.css';

interface SupportAnalyticsProps {
  tickets: SupportTicket[];
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
}

interface AnalyticsData {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  priorityDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  categoryDistribution: Record<string, number>;
  monthlyTrend: Array<{ month: string; count: number }>;
}

const SupportAnalytics: React.FC<SupportAnalyticsProps> = ({
  tickets,
  dateRange = '30d',
  onDateRangeChange
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    averageResolutionTime: 0,
    priorityDistribution: {},
    statusDistribution: {},
    categoryDistribution: {},
    monthlyTrend: []
  });

  const dateRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  useEffect(() => {
    calculateAnalytics();
  }, [tickets, dateRange]);

  const calculateAnalytics = () => {
    const filteredTickets = filterTicketsByDateRange(tickets, dateRange);

    const totalTickets = filteredTickets.length;
    const openTickets = filteredTickets.filter(t => t.status === 'OPEN').length;
    const resolvedTickets = filteredTickets.filter(t => t.status === 'RESOLVED').length;
    const closedTickets = filteredTickets.filter(t => t.status === 'CLOSED').length;

    // Calculate priority distribution
    const priorityDistribution = filteredTickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate status distribution
    const statusDistribution = filteredTickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category distribution
    const categoryDistribution = filteredTickets.reduce((acc, ticket) => {
      acc[ticket.category] = (acc[ticket.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average resolution time
    const resolvedTicketsWithTime = filteredTickets.filter(t => 
      t.status === 'RESOLVED' && t.resolvedAt
    );
    const totalResolutionTime = resolvedTicketsWithTime.reduce((acc, ticket) => {
      const created = new Date(ticket.createdAt);
      const resolved = new Date(ticket.resolvedAt!);
      return acc + (resolved.getTime() - created.getTime());
    }, 0);
    const averageResolutionTime = resolvedTicketsWithTime.length > 0 
      ? totalResolutionTime / resolvedTicketsWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Calculate monthly trend
    const monthlyTrend = calculateMonthlyTrend(filteredTickets);

    setAnalyticsData({
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime,
      priorityDistribution,
      statusDistribution,
      categoryDistribution,
      monthlyTrend
    });
  };

  const filterTicketsByDateRange = (tickets: SupportTicket[], range: string): SupportTicket[] => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (range) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }

    return tickets.filter(ticket => new Date(ticket.createdAt) >= cutoffDate);
  };

  const calculateMonthlyTrend = (tickets: SupportTicket[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend: Array<{ month: string; count: number }> = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = months[date.getMonth()];
      
      const count = tickets.filter(ticket => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate.getMonth() === date.getMonth() && 
               ticketDate.getFullYear() === date.getFullYear();
      }).length;

      trend.push({ month: monthKey, count });
    }

    return trend;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return '#dc2626';
      case 'HIGH':
        return '#d97706';
      case 'MEDIUM':
        return '#0284c7';
      case 'LOW':
        return '#16a34a';
      default:
        return '#6b7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '#0284c7';
      case 'IN_PROGRESS':
        return '#d97706';
      case 'RESOLVED':
        return '#16a34a';
      case 'CLOSED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatDays = (days: number) => {
    return days.toFixed(1);
  };

  return (
    <div className="support-analytics">
      <div className="analytics-header">
        <h2>Support Analytics</h2>
        <div className="date-range-selector">
          <label htmlFor="date-range">Time Period:</label>
          <select
            id="date-range"
            value={dateRange}
            onChange={(e) => onDateRangeChange?.(e.target.value)}
            aria-label="Select date range for analytics"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Key Metrics */}
        <div className="metrics-section">
          <h3>Key Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(analyticsData.totalTickets)}</div>
                <div className="metric-label">Total Tickets</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">🔓</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(analyticsData.openTickets)}</div>
                <div className="metric-label">Open Tickets</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{formatNumber(analyticsData.resolvedTickets)}</div>
                <div className="metric-label">Resolved</div>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-value">{formatDays(analyticsData.averageResolutionTime)}</div>
                <div className="metric-label">Avg. Resolution (days)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="chart-section">
          <h3>Priority Distribution</h3>
          <div className="chart-container">
            {Object.entries(analyticsData.priorityDistribution).map(([priority, count]) => (
              <div key={priority} className="chart-bar">
                <div className="bar-label">{priority}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(count / analyticsData.totalTickets) * 100}%`,
                      backgroundColor: getPriorityColor(priority)
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="chart-section">
          <h3>Status Distribution</h3>
          <div className="chart-container">
            {Object.entries(analyticsData.statusDistribution).map(([status, count]) => (
              <div key={status} className="chart-bar">
                <div className="bar-label">{status.replace('_', ' ')}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(count / analyticsData.totalTickets) * 100}%`,
                      backgroundColor: getStatusColor(status)
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-section">
          <h3>Category Distribution</h3>
          <div className="chart-container">
            {Object.entries(analyticsData.categoryDistribution).map(([category, count]) => (
              <div key={category} className="chart-bar">
                <div className="bar-label">{category.replace('_', ' ')}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${(count / analyticsData.totalTickets) * 100}%`,
                      backgroundColor: '#3b82f6'
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="trend-section">
          <h3>Monthly Trend</h3>
          <div className="trend-chart">
            {analyticsData.monthlyTrend.map((item, index) => (
              <div key={index} className="trend-bar">
                <div className="trend-value">{item.count}</div>
                <div 
                  className="trend-fill"
                  style={{
                    height: `${Math.max((item.count / Math.max(...analyticsData.monthlyTrend.map(t => t.count))) * 100, 5)}%`
                  }}
                ></div>
                <div className="trend-label">{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAnalytics;
