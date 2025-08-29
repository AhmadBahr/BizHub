import React from 'react';
import './InvoiceAnalytics.css';

interface InvoiceAnalyticsProps {
  data: {
    totalInvoices: number;
    totalValue: number;
    averageValue: number;
    paidAmount: number;
    outstandingAmount: number;
    overdueAmount: number;
    invoicesByStatus: {
      DRAFT: number;
      SENT: number;
      PAID: number;
      OVERDUE: number;
      CANCELLED: number;
      PARTIAL: number;
    };
    monthlyTrends: Array<{
      month: string;
      invoices: number;
      value: number;
      paid: number;
    }>;
    topPerformingContacts: Array<{
      contactName: string;
      invoicesCount: number;
      totalValue: number;
      paidAmount: number;
    }>;
  };
  loading?: boolean;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
}

const InvoiceAnalytics: React.FC<InvoiceAnalyticsProps> = ({
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

  const getCollectionRate = () => {
    if (data.totalValue === 0) return 0;
    return ((data.paidAmount / data.totalValue) * 100).toFixed(1);
  };

  const getOverduePercentage = () => {
    if (data.totalValue === 0) return 0;
    return ((data.overdueAmount / data.totalValue) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="invoice-analytics">
      <div className="analytics-header">
        <h3>Financial Analytics</h3>
        <div className="date-range-selector">
          <label htmlFor="dateRange">Date Range:</label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div className="metric-content">
            <h4>Total Invoices</h4>
            <p className="metric-value">{data.totalInvoices}</p>
            <p className="metric-label">Invoices created</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="metric-content">
            <h4>Total Value</h4>
            <p className="metric-value">{formatCurrency(data.totalValue)}</p>
            <p className="metric-label">Gross invoice value</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="metric-content">
            <h4>Average Value</h4>
            <p className="metric-value">{formatCurrency(data.averageValue)}</p>
            <p className="metric-label">Per invoice</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="metric-content">
            <h4>Paid Amount</h4>
            <p className="metric-value">{formatCurrency(data.paidAmount)}</p>
            <p className="metric-label">{getCollectionRate()}% collection rate</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="metric-content">
            <h4>Outstanding</h4>
            <p className="metric-value">{formatCurrency(data.outstandingAmount)}</p>
            <p className="metric-label">Awaiting payment</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="metric-content">
            <h4>Overdue</h4>
            <p className="metric-value overdue">{formatCurrency(data.overdueAmount)}</p>
            <p className="metric-label">{getOverduePercentage()}% of total</p>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-section">
          <h4>Invoices by Status</h4>
          <div className="status-chart">
            {Object.entries(data.invoicesByStatus).map(([status, count]) => (
              <div key={status} className="status-bar">
                <div className="status-label">
                  <span className={`status-dot ${status.toLowerCase()}`}></span>
                  {status}
                </div>
                <div className="status-bar-container">
                  <div 
                    className={`status-bar-fill ${status.toLowerCase()}`}
                    style={{ width: `${(count / data.totalInvoices) * 100}%` }}
                  ></div>
                  <span className="status-count">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-section">
          <h4>Monthly Trends</h4>
          <div className="trends-chart">
            {data.monthlyTrends.map((trend, index) => (
              <div key={index} className="trend-item">
                <div className="trend-header">
                  <span className="trend-month">{trend.month}</span>
                  <span className="trend-invoices">{trend.invoices} invoices</span>
                </div>
                <div className="trend-bars">
                  <div className="trend-bar">
                    <div className="trend-bar-fill total" style={{ width: `${(trend.value / Math.max(...data.monthlyTrends.map(t => t.value))) * 100}%` }}></div>
                    <span className="trend-label">Total: {formatCurrency(trend.value)}</span>
                  </div>
                  <div className="trend-bar">
                    <div className="trend-bar-fill paid" style={{ width: `${(trend.paid / Math.max(...data.monthlyTrends.map(t => t.paid))) * 100}%` }}></div>
                    <span className="trend-label">Paid: {formatCurrency(trend.paid)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="top-contacts-section">
        <h4>Top Performing Contacts</h4>
        <div className="contacts-table">
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Invoices</th>
                <th>Total Value</th>
                <th>Paid Amount</th>
                <th>Collection Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformingContacts.map((contact, index) => (
                <tr key={index}>
                  <td>
                    <span className="contact-name">{contact.contactName}</span>
                  </td>
                  <td>
                    <span className="contact-invoices">{contact.invoicesCount}</span>
                  </td>
                  <td>
                    <span className="contact-value">{formatCurrency(contact.totalValue)}</span>
                  </td>
                  <td>
                    <span className="contact-paid">{formatCurrency(contact.paidAmount)}</span>
                  </td>
                  <td>
                    <span className="contact-rate">
                      {contact.totalValue > 0 ? ((contact.paidAmount / contact.totalValue) * 100).toFixed(1) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAnalytics;
