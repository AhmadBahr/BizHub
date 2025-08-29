import React, { useState, useEffect } from 'react';
import { apiService } from '../../services';
import './LeadAnalytics.css';



interface LeadAnalyticsData {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  conversionRate: number;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyLeads: Array<{
    month: string;
    leads: number;
  }>;
  topSources: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
}

const LeadAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<LeadAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/analytics/leads');
      if (response.success) {
        setAnalyticsData(response.data as LeadAnalyticsData);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading lead analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default data structure while loading
  const defaultData: LeadAnalyticsData = {
    totalLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    sourceDistribution: [],
    statusDistribution: [],
    monthlyLeads: [],
    topSources: []
  };

    const data = analyticsData || defaultData;

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': '#3b82f6',
      'Contacted': '#8b5cf6',
      'Qualified': '#f59e0b',
      'Proposal': '#ec4899',
      'Negotiation': '#ef4444',
      'Closed Won': '#10b981',
      'Closed Lost': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="lead-analytics">
        <div className="analytics-header">
          <h3 className="analytics-title">Lead Analytics</h3>
          <p className="analytics-subtitle">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lead-analytics">
        <div className="analytics-header">
          <h3 className="analytics-title">Lead Analytics</h3>
          <p className="analytics-subtitle">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-analytics">
      <div className="analytics-header">
        <h3 className="analytics-title">Lead Analytics</h3>
        <p className="analytics-subtitle">Real-time insights and performance metrics</p>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card primary">
          <div className="card-header">
            <span className="card-title">Total Leads</span>
            <span className="card-icon">👥</span>
          </div>
          <div className="card-value">{data.totalLeads}</div>
          <div className="card-change positive">
            <span className="change-icon">↗</span>
            +12% from last month
          </div>
        </div>

        <div className="analytics-card success">
          <div className="card-header">
            <span className="card-title">Qualified Leads</span>
            <span className="card-icon">✅</span>
          </div>
          <div className="card-value">{data.activeLeads}</div>
          <div className="card-change positive">
            <span className="change-icon">↗</span>
            +8% from last month
          </div>
        </div>

        <div className="analytics-card warning">
          <div className="card-header">
            <span className="card-title">New This Month</span>
            <span className="card-icon">🆕</span>
          </div>
          <div className="card-value">{data.convertedLeads}</div>
          <div className="card-change neutral">
            <span className="change-icon">→</span>
            Same as last month
          </div>
        </div>

        <div className="analytics-card info">
          <div className="card-header">
            <span className="card-title">Conversion Rate</span>
            <span className="card-icon">📊</span>
          </div>
          <div className="card-value">{data.conversionRate}%</div>
          <div className="card-change positive">
            <span className="change-icon">↗</span>
            +3.2% from last month
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Conversion Rate</div>
          <div className="stat-value">
            {data.conversionRate}%
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Active Lead Rate</div>
          <div className="stat-value">
            {Math.round((data.activeLeads / data.totalLeads) * 100)}%
          </div>
        </div>
      </div>

      <div className="source-distribution">
        <h4>Top Lead Sources</h4>
        {data.topSources.map((source, index) => (
          <div key={index} className="source-item">
            <div className="source-name">
              <div 
                className="source-icon"
                style={{ backgroundColor: getStatusColor(source.source) }}
              >
                {source.source.charAt(0)}
              </div>
              {source.source}
            </div>
            <div className="source-count">{source.count} ({source.percentage}%)</div>
          </div>
        ))}
      </div>

      <div className="status-distribution">
        <h4>Status Distribution</h4>
        {analyticsData.statusDistribution.map((status, index) => (
          <div key={index} className="status-item">
            <div className="status-info">
              <div 
                className="status-dot"
                style={{ backgroundColor: status.color }}
              ></div>
              <span className="status-name">{status.status}</span>
            </div>
            <div className="status-count">{status.count}</div>
          </div>
        ))}
      </div>

      <div className="monthly-trend">
        <div className="trend-header">
          <h4 className="trend-title">Monthly Trend</h4>
          <span className="trend-period">Last 12 Months</span>
        </div>
        <div className="trend-chart">
          {/* This would be replaced with an actual chart component */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'end', 
            gap: '8px', 
            height: '100%',
            padding: '16px'
          }}>
            {analyticsData.monthlyTrend.map((month, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '4px'
              }}>
                <div style={{
                  width: '20px',
                  height: `${(month.leads / 31) * 100}%`,
                  backgroundColor: 'var(--primary-color)',
                  borderRadius: '2px 2px 0 0',
                  minHeight: '4px'
                }}></div>
                <div style={{
                  width: '20px',
                  height: `${(month.qualified / 31) * 100}%`,
                  backgroundColor: 'var(--success-color)',
                  borderRadius: '2px 2px 0 0',
                  minHeight: '4px'
                }}></div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-secondary)',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'center'
                }}>
                  {month.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadAnalytics;
