import React from 'react';
import './LeadFilters.css';

interface LeadFiltersProps {
  searchTerm: string;
  statusFilter: string;
  sourceFilter: string;
  onSearch: (term: string) => void;
  onStatusFilter: (status: string) => void;
  onSourceFilter: (source: string) => void;
  onClearFilters: () => void;
}

const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  statusFilter,
  sourceFilter,
  onSearch,
  onStatusFilter,
  onSourceFilter,
  onClearFilters
}) => {
  const statuses = ['All', 'New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const sources = ['All', 'Website', 'Referral', 'Social Media', 'Email', 'Phone', 'Event', 'Cold Call', 'Other'];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusFilter(e.target.value);
  };

  const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSourceFilter(e.target.value);
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'All' || sourceFilter !== 'All';

  return (
    <div className="lead-filters">
      <div className="filters-header">
        <h3 className="filters-title">Filters</h3>
        <div className="filters-actions">
          {hasActiveFilters && (
            <button className="clear-filters" onClick={onClearFilters}>
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="filters-content">
        <div className="filter-group">
          <label className="filter-label">Search Leads</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search by title, contact, or company..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select className="filter-select" value={statusFilter} onChange={handleStatusChange}>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Source</label>
          <select className="filter-select" value={sourceFilter} onChange={handleSourceChange}>
            {sources.map(source => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="quick-filters">
        <div className="status-filters">
          <h4>Quick Status Filters</h4>
          <div className="filter-buttons">
            {statuses.slice(1).map(status => (
              <button
                key={status}
                className={`quick-filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => onStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="source-filters">
          <h4>Quick Source Filters</h4>
          <div className="filter-buttons">
            {sources.slice(1).map(source => (
              <button
                key={source}
                className={`quick-filter-btn ${sourceFilter === source ? 'active' : ''}`}
                onClick={() => onSourceFilter(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        <div className="score-filters">
          <h4>Score Ranges</h4>
          <div className="filter-buttons">
            <button
              className={`quick-filter-btn ${statusFilter === 'High Score' ? 'active' : ''}`}
              onClick={() => onStatusFilter('High Score')}
            >
              80-100
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'Medium Score' ? 'active' : ''}`}
              onClick={() => onStatusFilter('Medium Score')}
            >
              40-79
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'Low Score' ? 'active' : ''}`}
              onClick={() => onStatusFilter('Low Score')}
            >
              0-39
            </button>
          </div>
        </div>

        <div className="value-filters">
          <h4>Value Ranges</h4>
          <div className="filter-buttons">
            <button
              className={`quick-filter-btn ${statusFilter === 'High Value' ? 'active' : ''}`}
              onClick={() => onStatusFilter('High Value')}
            >
              $10K+
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'Medium Value' ? 'active' : ''}`}
              onClick={() => onStatusFilter('Medium Value')}
            >
              $1K-$10K
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'Low Value' ? 'active' : ''}`}
              onClick={() => onStatusFilter('Low Value')}
            >
              &lt;$1K
            </button>
          </div>
        </div>

        <div className="date-filters">
          <h4>Date Filters</h4>
          <div className="filter-buttons">
            <button
              className={`quick-filter-btn ${statusFilter === 'This Week' ? 'active' : ''}`}
              onClick={() => onStatusFilter('This Week')}
            >
              This Week
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'This Month' ? 'active' : ''}`}
              onClick={() => onStatusFilter('This Month')}
            >
              This Month
            </button>
            <button
              className={`quick-filter-btn ${statusFilter === 'Last 30 Days' ? 'active' : ''}`}
              onClick={() => onStatusFilter('Last 30 Days')}
            >
              Last 30 Days
            </button>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="filters-footer">
          <div className="filters-summary">
            <strong>Active Filters:</strong>
            {searchTerm && <span> Search: "{searchTerm}"</span>}
            {statusFilter !== 'All' && <span> Status: {statusFilter}</span>}
            {sourceFilter !== 'All' && <span> Source: {sourceFilter}</span>}
          </div>
          <button className="apply-filters" onClick={onClearFilters}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadFilters;
