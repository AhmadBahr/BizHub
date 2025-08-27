import React from 'react';
import './DealFilters.css';

interface DealFiltersProps {
  searchTerm: string;
  statusFilter: string;
  assignedToFilter: string;
  onSearch: (term: string) => void;
  onStatusFilter: (status: string) => void;
  onAssignedToFilter: (assignedTo: string) => void;
  onClearFilters: () => void;
}

const DealFilters: React.FC<DealFiltersProps> = ({
  searchTerm,
  statusFilter,
  assignedToFilter,
  onSearch,
  onStatusFilter,
  onAssignedToFilter,
  onClearFilters
}) => {
  const statuses = [
    'All Statuses',
    'Prospecting',
    'Qualification',
    'Proposal',
    'Negotiation',
    'Closed Won',
    'Closed Lost'
  ];

  const assignedToOptions = [
    'All Users',
    'Unassigned',
    'Sarah Johnson',
    'Mike Chen',
    'Emily Davis'
  ];

  return (
    <div className="deal-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button 
          className="clear-filters"
          onClick={onClearFilters}
        >
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="search">Search Deals</label>
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="search"
            placeholder="Search by title, contact, or company..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.target.value)}
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label htmlFor="assignedTo">Assigned To</label>
        <select
          id="assignedTo"
          value={assignedToFilter}
          onChange={(e) => onAssignedToFilter(e.target.value)}
        >
          {assignedToOptions.map(user => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>Quick Filters</label>
        <div className="quick-filters">
          <button
            className={`quick-filter ${statusFilter === 'Prospecting' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Prospecting')}
          >
            🎯 Prospecting
          </button>
          <button
            className={`quick-filter ${statusFilter === 'Qualification' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Qualification')}
          >
            📋 Qualification
          </button>
          <button
            className={`quick-filter ${statusFilter === 'Proposal' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Proposal')}
          >
            📄 Proposal
          </button>
          <button
            className={`quick-filter ${statusFilter === 'Negotiation' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Negotiation')}
          >
            🤝 Negotiation
          </button>
        </div>
      </div>

      <div className="filter-section">
        <label>Value Range</label>
        <div className="value-filters">
          <button className="value-filter">$0 - $10K</button>
          <button className="value-filter">$10K - $50K</button>
          <button className="value-filter">$50K - $100K</button>
          <button className="value-filter">$100K+</button>
        </div>
      </div>

      <div className="filter-section">
        <label>Probability</label>
        <div className="probability-filters">
          <button className="probability-filter">0-25%</button>
          <button className="probability-filter">26-50%</button>
          <button className="probability-filter">51-75%</button>
          <button className="probability-filter">76-100%</button>
        </div>
      </div>

      <div className="filter-section">
        <label>Source</label>
        <div className="source-filters">
          <button className="source-filter">Website</button>
          <button className="source-filter">Referral</button>
          <button className="source-filter">Social Media</button>
          <button className="source-filter">Email</button>
          <button className="source-filter">Phone</button>
        </div>
      </div>
    </div>
  );
};

export default DealFilters;
