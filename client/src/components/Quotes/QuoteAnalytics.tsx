import React from 'react';
import './QuoteAnalytics.css';

interface QuoteAnalyticsData {
  totalQuotes: number;
  totalValue: number;
  averageValue: number;
  conversionRate: number;
  quotesByStatus: {
    DRAFT: number;
    SENT: number;
    VIEWED: number;
    ACCEPTED: number;
    REJECTED: number;
    EXPIRED: number;
  };
  monthlyTrends: {
    month: string;
    quotes: number;
    value: number;
  }[];
  topPerformingContacts: {
    contactName: string;
    quotesCount: number;
    totalValue: number;
    conversionRate: number;
  }[];
}

interface QuoteAnalyticsProps {
  data: QuoteAnalyticsData;
  loading?: boolean;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

const QuoteAnalytics: React.FC<QuoteAnalyticsProps> = ({
  data,
  loading = false,
  dateRange,
  onDateRangeChange,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: '#6c757d',
      SENT: '#17a2b8',
      VIEWED: '#ffc107',
      ACCEPTED: '#28a745',
      REJECTED: '#dc3545',
      EXPIRED: '#dc3545',
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="quote-analytics">
      <div className="analytics-header">
        <h2>Quote Analytics</h2>
        <div className="date-range-selector">
          <label htmlFor="date-range">Date Range:</label>
          <select
            id="date-range"
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="metric-content">
            <h3>Total Quotes</h3>
            <p className="metric-value">{data.totalQuotes.toLocaleString()}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="metric-content">
            <h3>Total Value</h3>
            <p className="metric-value">{formatCurrency(data.totalValue)}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h3>Average Value</h3>
            <p className="metric-value">{formatCurrency(data.averageValue)}</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-percentage"></i>
          </div>
          <div className="metric-content">
            <h3>Conversion Rate</h3>
            <p className="metric-value">{formatPercentage(data.conversionRate)}</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Quotes by Status</h3>
          <div className="status-chart">
            {Object.entries(data.quotesByStatus).map(([status, count]) => (
              <div key={status} className="status-bar">
                <div className="status-info">
                  <span className="status-label">{status}</span>
                  <span className="status-count">{count}</span>
                </div>
                <div className="status-progress">
                  <div
                    className="status-fill"
                    style={{
                      width: `${(count / data.totalQuotes) * 100}%`,
                      backgroundColor: getStatusColor(status),
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card">
          <h3>Monthly Trends</h3>
          <div className="trends-chart">
            {data.monthlyTrends.map((trend, index) => (
              <div key={index} className="trend-bar">
                <div className="trend-info">
                  <span className="trend-month">{trend.month}</span>
                  <span className="trend-value">{formatCurrency(trend.value)}</span>
                </div>
                <div className="trend-progress">
                  <div
                    className="trend-fill"
                    style={{
                      width: `${(trend.value / Math.max(...data.monthlyTrends.map(t => t.value))) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="trend-count">{trend.quotes} quotes</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-card full-width">
        <h3>Top Performing Contacts</h3>
        <div className="contacts-table">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Quotes</th>
                <th>Total Value</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformingContacts.map((contact, index) => (
                <tr key={index}>
                  <td>
                    <div className="contact-info">
                      <span className="contact-name">{contact.contactName}</span>
                    </div>
                  </td>
                  <td>{contact.quotesCount}</td>
                  <td>{formatCurrency(contact.totalValue)}</td>
                  <td>{formatPercentage(contact.conversionRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuoteAnalytics;
