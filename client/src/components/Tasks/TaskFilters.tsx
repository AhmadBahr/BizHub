import React from 'react';
import './TaskFilters.css';

interface TaskFiltersProps {
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  onSearch: (term: string) => void;
  onStatusFilter: (status: string) => void;
  onPriorityFilter: (priority: string) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchTerm,
  statusFilter,
  priorityFilter,
  onSearch,
  onStatusFilter,
  onPriorityFilter
}) => {
  const statuses = [
    'All Statuses',
    'Not Started',
    'In Progress',
    'Under Review',
    'Completed',
    'Cancelled'
  ];

  const priorities = [
    'All Priorities',
    'Low',
    'Medium',
    'High'
  ];

  const categories = [
    'All Categories',
    'General',
    'Sales',
    'Marketing',
    'Development',
    'Support',
    'Administration',
    'Research',
    'Planning'
  ];

  return (
    <div className="task-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button 
          className="clear-filters"
          onClick={() => {
            onSearch('');
            onStatusFilter('All Statuses');
            onPriorityFilter('All Priorities');
          }}
        >
          Clear All
        </button>
      </div>

      <div className="filter-section">
        <label htmlFor="search">Search Tasks</label>
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            id="search"
            placeholder="Search by title, description, or assignee..."
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
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priorityFilter}
          onChange={(e) => onPriorityFilter(e.target.value)}
        >
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-section">
        <label>Quick Status Filters</label>
        <div className="quick-filters">
          <button
            className={`quick-filter ${statusFilter === 'Not Started' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Not Started')}
          >
            ⏳ Not Started
          </button>
          <button
            className={`quick-filter ${statusFilter === 'In Progress' ? 'active' : ''}`}
            onClick={() => onStatusFilter('In Progress')}
          >
            🔄 In Progress
          </button>
          <button
            className={`quick-filter ${statusFilter === 'Under Review' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Under Review')}
          >
            👀 Under Review
          </button>
          <button
            className={`quick-filter ${statusFilter === 'Completed' ? 'active' : ''}`}
            onClick={() => onStatusFilter('Completed')}
          >
            ✅ Completed
          </button>
        </div>
      </div>

      <div className="filter-section">
        <label>Priority Quick Filters</label>
        <div className="priority-filters">
          <button
            className={`priority-filter low ${priorityFilter === 'Low' ? 'active' : ''}`}
            onClick={() => onPriorityFilter('Low')}
          >
            🟢 Low
          </button>
          <button
            className={`priority-filter medium ${priorityFilter === 'Medium' ? 'active' : ''}`}
            onClick={() => onPriorityFilter('Medium')}
          >
            🟡 Medium
          </button>
          <button
            className={`priority-filter high ${priorityFilter === 'High' ? 'active' : ''}`}
            onClick={() => onPriorityFilter('High')}
          >
            🔴 High
          </button>
        </div>
      </div>

      <div className="filter-section">
        <label>Category</label>
        <div className="category-filters">
          {categories.slice(1).map(category => (
            <button
              key={category}
              className="category-filter"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <label>Due Date</label>
        <div className="date-filters">
          <button className="date-filter">Today</button>
          <button className="date-filter">Tomorrow</button>
          <button className="date-filter">This Week</button>
          <button className="date-filter">Next Week</button>
          <button className="date-filter">Overdue</button>
        </div>
      </div>

      <div className="filter-section">
        <label>Time Estimates</label>
        <div className="time-filters">
          <button className="time-filter">Quick (&lt; 1h)</button>
          <button className="time-filter">Short (1-4h)</button>
          <button className="time-filter">Medium (4-8h)</button>
          <button className="time-filter">Long (8h+)</button>
        </div>
      </div>

      <div className="filter-section">
        <label>Assignee</label>
        <div className="assignee-filters">
          <button className="assignee-filter">Unassigned</button>
          <button className="assignee-filter">Assigned to Me</button>
          <button className="assignee-filter">My Team</button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
