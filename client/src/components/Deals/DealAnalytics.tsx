import React, { useState, useEffect } from 'react';
import { apiService } from '../../services';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './DealAnalytics.css';



interface DealAnalyticsData {
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  lostDeals: number;
  activeDeals: number;
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
  stageDistribution: Array<{
    stage: string;
    count: number;
    value: number;
    color: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    deals: number;
  }>;
  topPerformers: Array<{
    name: string;
    deals: number;
    value: number;
    avatar: string;
  }>;
}

const DealAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<DealAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/analytics/deals');
      if (response.success) {
        setAnalyticsData(response.data as DealAnalyticsData);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading deal analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default data structure while loading
  const defaultData = {
    totalDeals: 0,
    totalValue: 0,
    wonDeals: 0,
    lostDeals: 0,
    activeDeals: 0,
    conversionRate: 0,
    averageDealSize: 0,
    averageSalesCycle: 0,
    stageDistribution: [],
    monthlyRevenue: [],
    topPerformers: []
  };

    const data = analyticsData || defaultData;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="deal-analytics">
        <div className="analytics-header">
          <h3>Deal Analytics</h3>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="deal-analytics">
        <div className="analytics-header">
          <h3>Deal Analytics</h3>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

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
            <div className="metric-value">{formatCurrency(data.totalValue)}</div>
            <div className="metric-label">Total Pipeline Value</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <div className="metric-value">{data.totalDeals}</div>
            <div className="metric-label">Total Deals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{data.wonDeals}</div>
            <div className="metric-label">Won Deals</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{data.conversionRate}%</div>
            <div className="metric-label">Win Rate</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Revenue Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.monthlyRevenue}>
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
          {data.stageDistribution.map((stage) => (
            <div key={stage.stage} className="stage-item">
              <div className="stage-info">
                <span className="stage-name">{stage.stage}</span>
                <span className="stage-count">{stage.count} deals</span>
              </div>
              <div className="stage-bar">
                <div 
                  className="stage-progress"
                  style={{ 
                    width: `${(stage.count / data.totalDeals) * 100}%`,
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
          {data.topPerformers.map((performer, index) => (
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
            <div className="key-metric-value">{formatCurrency(data.averageDealSize)}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Sales Cycle (days)</div>
            <div className="key-metric-value">{data.averageSalesCycle}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Active Pipeline</div>
            <div className="key-metric-value">{data.activeDeals} deals</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealAnalytics;
