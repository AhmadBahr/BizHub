import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  XMarkIcon
} from '@heroicons/react/24/outline';
import './AdvancedSearch.css';

interface FilterOption {
  field: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
}

interface SearchFilter {
  field: string;
  operator: string;
  value: string | number | boolean;
}

interface AdvancedSearchProps {
  placeholder?: string;
  filters: FilterOption[];
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onClear?: () => void;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = 'Search...',
  filters,
  onSearch,
  onClear,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'starts_with', label: 'Starts with' },
      { value: 'ends_with', label: 'Ends with' },
    ],
    select: [
      { value: 'equals', label: 'Equals' },
      { value: 'not_equals', label: 'Not equals' },
    ],
    date: [
      { value: 'equals', label: 'Equals' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' },
    ],
    number: [
      { value: 'equals', label: 'Equals' },
      { value: 'greater_than', label: 'Greater than' },
      { value: 'less_than', label: 'Less than' },
      { value: 'between', label: 'Between' },
    ],
    boolean: [
      { value: 'equals', label: 'Equals' },
    ],
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query, activeFilters);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, activeFilters, onSearch]);

  const addFilter = (filter: SearchFilter) => {
    setActiveFilters(prev => [...prev, filter]);
  };

  const removeFilter = (index: number) => {
    setActiveFilters(prev => prev.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, filter: Partial<SearchFilter>) => {
    setActiveFilters(prev => 
      prev.map((f, i) => i === index ? { ...f, ...filter } : f)
    );
  };

  const clearAll = () => {
    setQuery('');
    setActiveFilters([]);
    onClear?.();
  };

  const getOperatorOptions = (type: string) => {
    return operators[type as keyof typeof operators] || operators.text;
  };

  const renderFilterInput = (filter: FilterOption, filterIndex: number) => {
    const currentFilter = activeFilters[filterIndex];
    const value = currentFilter?.value || '';

    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder={`Enter ${filter.label.toLowerCase()}`}
            value={value as string}
            onChange={(e) => updateFilter(filterIndex, { value: e.target.value })}
            className="filter-input"
          />
        );
      
      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => updateFilter(filterIndex, { value: e.target.value })}
            className="filter-input"
          >
            <option value="">Select {filter.label.toLowerCase()}</option>
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value as string}
            onChange={(e) => updateFilter(filterIndex, { value: e.target.value })}
            className="filter-input"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            placeholder={`Enter ${filter.label.toLowerCase()}`}
            value={value as number}
            onChange={(e) => updateFilter(filterIndex, { value: parseFloat(e.target.value) || '' })}
            className="filter-input"
          />
        );
      
      case 'boolean':
        return (
          <select
            value={value as string}
            onChange={(e) => updateFilter(filterIndex, { value: e.target.value === 'true' })}
            className="filter-input"
          >
            <option value="">Select {filter.label.toLowerCase()}</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`advanced-search ${className}`}>
      <div className="search-container">
        <div className="search-input-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          {query && (
            <button
              className="clear-search-btn"
              onClick={() => setQuery('')}
              title="Clear search"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          title="Advanced filters"
        >
          <FunnelIcon className="w-4 h-4" />
          {activeFilters.length > 0 && (
            <span className="filter-count">{activeFilters.length}</span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h4>Advanced Filters</h4>
            <button
              className="add-filter-btn"
              onClick={() => {
                const firstFilter = filters[0];
                if (firstFilter) {
                  addFilter({
                    field: firstFilter.field,
                    operator: getOperatorOptions(firstFilter.type)[0].value,
                    value: '',
                  });
                }
              }}
            >
              Add Filter
            </button>
          </div>

          {activeFilters.length === 0 ? (
            <div className="no-filters">
              <p>No filters applied. Click "Add Filter" to get started.</p>
            </div>
          ) : (
            <div className="filters-list">
              {activeFilters.map((filter, index) => {
                const filterOption = filters.find(f => f.field === filter.field);
                if (!filterOption) return null;

                return (
                  <div key={index} className="filter-item">
                    <div className="filter-controls">
                      <select
                        value={filter.field}
                        onChange={(e) => updateFilter(index, { field: e.target.value })}
                        className="filter-field-select"
                      >
                        {filters.map((f) => (
                          <option key={f.field} value={f.field}>
                            {f.label}
                          </option>
                        ))}
                      </select>

                      <select
                        value={filter.operator}
                        onChange={(e) => updateFilter(index, { operator: e.target.value })}
                        className="filter-operator-select"
                      >
                        {getOperatorOptions(filterOption.type).map((op) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {renderFilterInput(filterOption, index)}

                      <button
                        className="remove-filter-btn"
                        onClick={() => removeFilter(index)}
                        title="Remove filter"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeFilters.length > 0 && (
            <div className="filters-actions">
              <button className="clear-filters-btn" onClick={clearAll}>
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
