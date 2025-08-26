import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import './ContactFilters.css';

interface ContactFiltersProps {
  onSearch: (search: string) => void;
  onStatusFilter: (status: string) => void;
}

const ContactFilters: React.FC<ContactFiltersProps> = ({ onSearch, onStatusFilter }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusFilter(e.target.value);
  };

  return (
    <div className="contact-filters">
      <div className="filters-row">
        <div className="search-container">
          <MagnifyingGlassIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select 
            onChange={handleStatusChange}
            className="filter-select"
            defaultValue=""
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ContactFilters;





