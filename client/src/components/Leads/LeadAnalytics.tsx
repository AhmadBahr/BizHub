import React from 'react';
import './LeadAnalytics.css';

interface LeadAnalyticsProps {
  // This would typically receive analytics data from props
  // For now, we'll use mock data
}

const LeadAnalytics: React.FC<LeadAnalyticsProps> = () => {
  // Mock data - in a real app, this would come from the backend
  const analyticsData = {
    totalLeads: 156,
    newLeads: 23,
    qualifiedLeads: 89,
    conversionRate: 68.2,
    averageScore: 72.4,
    topSources: [
      { name: 'Website', count: 45, percentage: 28.8 },
      { name: 'Referral', count: 38, percentage: 24.4 },
      { name: 'Social Media', count: 32, percentage: 20.5 },
      { name: 'Email', count: 25, percentage: 16.0 },
      { name: 'Phone', count: 16, percentage: 10.3 }
    ],
    statusDistribution: [
      { status: 'New', count: 23, color: '#3b82f6' },
      { status: 'Contacted', count: 34, color: '#8b5cf6' },
      { status: 'Qualified', count: 89, color: '#f59e0b' },
      { status: 'Proposal', count: 12, color: '#ec4899' },
      { status: 'Negotiation', count: 8, color: '#ef4444' },
      { status: 'Closed Won', count: 15, color: '#10b981' },
      { status: 'Closed Lost', count: 5, color: '#6b7280' }
    ],
    monthlyTrend: [
      { month: 'Jan', leads: 12, qualified: 8 },
      { month: 'Feb', leads: 18, qualified: 12 },
      { month: 'Mar', leads: 15, qualified: 10 },
      { month: 'Apr', leads: 22, qualified: 15 },
      { month: 'May', leads: 28, qualified: 19 },
      { month: 'Jun', leads: 25, qualified: 17 },
      { month: 'Jul', leads: 31, qualified: 22 },
      { month: 'Aug', leads: 29, qualified: 20 },
      { month: 'Sep', leads: 26, qualified: 18 },
      { month: 'Oct', leads: 24, qualified: 16 },
      { month: 'Nov', leads: 21, qualified: 14 },
      { month: 'Dec', leads: 19, qualified: 13 }
    ]
  };

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
          <div className="card-value">{analyticsData.totalLeads}</div>
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
          <div className="card-value">{analyticsData.qualifiedLeads}</div>
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
          <div className="card-value">{analyticsData.newLeads}</div>
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
          <div className="card-value">{analyticsData.conversionRate}%</div>
          <div className="card-change positive">
            <span className="change-icon">↗</span>
            +3.2% from last month
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-label">Average Score</div>
          <div className="stat-value" style={{ color: getScoreColor(analyticsData.averageScore) }}>
            {analyticsData.averageScore}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Qualification Rate</div>
          <div className="stat-value">
            {Math.round((analyticsData.qualifiedLeads / analyticsData.totalLeads) * 100)}%
          </div>
        </div>
      </div>

      <div className="source-distribution">
        <h4>Top Lead Sources</h4>
        {analyticsData.topSources.map((source, index) => (
          <div key={index} className="source-item">
            <div className="source-name">
              <div 
                className="source-icon"
                style={{ backgroundColor: getStatusColor(source.name) }}
              >
                {source.name.charAt(0)}
              </div>
              {source.name}
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
