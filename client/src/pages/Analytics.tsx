import React, { useState, useEffect } from 'react';
import { apiService } from '../services';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import './Analytics.css';

interface AnalyticsData {
  deals: any;
  tasks: any;
  leads: any;
  timestamp: string;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'tasks' | 'leads'>('overview');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/analytics/overview');
      if (response.success && response.data) {
        setAnalyticsData(response.data as AnalyticsData);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };



  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Deep insights into your business performance</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Deep insights into your business performance</p>
        </div>
        <div className="error-container">
          <p>Error: {error}</p>
          <button onClick={loadAnalytics} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Deep insights into your business performance</p>
        </div>
        <div className="no-data-container">
          <p>No analytics data available</p>
        </div>
      </div>
    );
  }

  const { deals, tasks, leads } = analyticsData;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1 className="analytics-title">Business Analytics</h1>
        <p className="analytics-subtitle">Comprehensive insights into your business performance</p>
        <div className="last-updated">
          Last updated: {new Date(analyticsData.timestamp).toLocaleString()}
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          Deals
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
        <button 
          className={`tab ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          Leads
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="analytics-content">
          <div className="overview-metrics">
            <div className="metric-card">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <div className="metric-value">{deals?.totalDeals || 0}</div>
                <div className="metric-label">Total Deals</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-content">
                <div className="metric-value">{formatCurrency(deals?.totalValue || 0)}</div>
                <div className="metric-label">Pipeline Value</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{tasks?.completedTasks || 0}</div>
                <div className="metric-label">Completed Tasks</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-value">{leads?.totalLeads || 0}</div>
                <div className="metric-label">Total Leads</div>
              </div>
            </div>
          </div>

          <div className="overview-charts">
            <div className="chart-section">
              <h3>Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deals?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h3>Task Completion Rate</h3>
              <div className="completion-rate">
                <div className="rate-circle">
                  <span className="rate-value">{tasks?.completionRate || 0}%</span>
                  <span className="rate-label">Completion Rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="analytics-content">
          <div className="deals-metrics">
            <div className="metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-content">
                <div className="metric-value">{deals?.conversionRate || 0}%</div>
                <div className="metric-label">Conversion Rate</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💎</div>
              <div className="metric-content">
                <div className="metric-value">{formatCurrency(deals?.averageDealSize || 0)}</div>
                <div className="metric-label">Avg Deal Size</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-content">
                <div className="metric-value">{deals?.averageSalesCycle || 0} days</div>
                <div className="metric-label">Sales Cycle</div>
              </div>
            </div>
          </div>

          <div className="deals-charts">
            <div className="chart-section">
              <h3>Deal Stage Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deals?.stageDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h3>Top Performers</h3>
              <div className="performers-list">
                {deals?.topPerformers?.map((performer: any, index: number) => (
                  <div key={performer.name} className="performer-item">
                    <div className="performer-rank">#{index + 1}</div>
                    <div className="performer-avatar">{performer.avatar}</div>
                    <div className="performer-info">
                      <div className="performer-name">{performer.name}</div>
                      <div className="performer-stats">
                        {performer.deals} deals • {formatCurrency(performer.value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="analytics-content">
          <div className="tasks-metrics">
            <div className="metric-card">
              <div className="metric-icon">📋</div>
              <div className="metric-content">
                <div className="metric-value">{tasks?.totalTasks || 0}</div>
                <div className="metric-label">Total Tasks</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-content">
                <div className="metric-value">{tasks?.completionRate || 0}%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⏰</div>
              <div className="metric-content">
                <div className="metric-value">{tasks?.overdueTasks || 0}</div>
                <div className="metric-label">Overdue</div>
              </div>
            </div>
          </div>

          <div className="tasks-charts">
            <div className="chart-section">
              <h3>Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tasks?.statusDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }: any) => `${status} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {tasks?.statusDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h3>Weekly Task Completion</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tasks?.weeklyCompletion || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Completed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    name="Created"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="analytics-content">
          <div className="leads-metrics">
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-content">
                <div className="metric-value">{leads?.conversionRate || 0}%</div>
                <div className="metric-label">Conversion Rate</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🔥</div>
              <div className="metric-content">
                <div className="metric-value">{leads?.activeLeads || 0}</div>
                <div className="metric-label">Active Leads</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💼</div>
              <div className="metric-content">
                <div className="metric-value">{leads?.convertedLeads || 0}</div>
                <div className="metric-label">Converted</div>
              </div>
            </div>
          </div>

          <div className="leads-charts">
            <div className="chart-section">
              <h3>Lead Source Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leads?.sourceDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-section">
              <h3>Top Lead Sources</h3>
              <div className="sources-list">
                {leads?.topSources?.map((source: any, index: number) => (
                  <div key={source.source} className="source-item">
                    <div className="source-rank">#{index + 1}</div>
                    <div className="source-info">
                      <div className="source-name">{source.source}</div>
                      <div className="source-stats">
                        {source.count} leads • {source.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;





