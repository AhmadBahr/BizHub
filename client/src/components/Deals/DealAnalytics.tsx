import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DealAnalytics.css';

interface DealAnalyticsProps {
  // This would typically receive analytics data from props
  // For now, we'll use mock data
}

const DealAnalytics: React.FC<DealAnalyticsProps> = () => {
  // Mock data - in a real app, this would come from the backend
  const analyticsData = {
    totalDeals: 89,
    totalValue: 2450000,
    wonDeals: 34,
    lostDeals: 12,
    activeDeals: 43,
    conversionRate: 73.9,
    averageDealSize: 27528,
    averageSalesCycle: 45,
    stageDistribution: [
      { stage: 'Prospecting', count: 15, value: 180000, color: '#3b82f6' },
      { stage: 'Qualification', count: 18, value: 320000, color: '#8b5cf6' },
      { stage: 'Proposal', count: 12, value: 450000, color: '#f59e0b' },
      { stage: 'Negotiation', count: 8, value: 380000, color: '#ec4899' },
      { stage: 'Closed Won', count: 34, value: 1120000, color: '#10b981' },
      { stage: 'Closed Lost', count: 12, value: 0, color: '#6b7280' }
    ],
    monthlyRevenue: [
      { month: 'Jan', revenue: 180000, deals: 8 },
      { month: 'Feb', revenue: 220000, deals: 12 },
      { month: 'Mar', revenue: 195000, deals: 10 },
      { month: 'Apr', revenue: 280000, deals: 15 },
      { month: 'May', revenue: 320000, deals: 18 },
      { month: 'Jun', revenue: 275000, deals: 14 }
    ],
    topPerformers: [
      { name: 'Sarah Johnson', deals: 12, value: 450000, avatar: '👩‍💼' },
      { name: 'Mike Chen', deals: 10, value: 380000, avatar: '👨‍💼' },
      { name: 'Emily Davis', deals: 8, value: 320000, avatar: '👩‍💼' },
      { name: 'David Wilson', deals: 7, value: 280000, avatar: '👨‍💼' }
    ]
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="deal-analytics">
      <div className="analytics-header">
        <h3>Deal Analytics</h3>
        <p>Pipeline performance and revenue insights</p>
      </div>

      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">{formatCurrency(analyticsData.totalValue)}</div>
            <div className="metric-label">Total Pipeline Value</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.totalDeals}</div>
            <div className="metric-label">Total Deals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.wonDeals}</div>
            <div className="metric-label">Won Deals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.conversionRate}%</div>
            <div className="metric-label">Win Rate</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Revenue Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analyticsData.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value / 1000}k`} />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => `${label} 2024`}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-section">
        <h4>Pipeline by Stage</h4>
        <div className="stage-distribution">
          {analyticsData.stageDistribution.map((stage) => (
            <div key={stage.stage} className="stage-item">
              <div className="stage-info">
                <span className="stage-name">{stage.stage}</span>
                <span className="stage-count">{stage.count} deals</span>
              </div>
              <div className="stage-bar">
                <div 
                  className="stage-progress"
                  style={{ 
                    width: `${(stage.count / analyticsData.totalDeals) * 100}%`,
                    backgroundColor: stage.color
                  }}
                ></div>
              </div>
              <span className="stage-value">{formatCurrency(stage.value)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Top Performers</h4>
        <div className="performers-list">
          {analyticsData.topPerformers.map((performer, index) => (
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

      <div className="analytics-section">
        <h4>Key Metrics</h4>
        <div className="key-metrics">
          <div className="key-metric">
            <div className="key-metric-label">Average Deal Size</div>
            <div className="key-metric-value">{formatCurrency(analyticsData.averageDealSize)}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Sales Cycle (days)</div>
            <div className="key-metric-value">{analyticsData.averageSalesCycle}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Active Pipeline</div>
            <div className="key-metric-value">{analyticsData.activeDeals} deals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealAnalytics;
