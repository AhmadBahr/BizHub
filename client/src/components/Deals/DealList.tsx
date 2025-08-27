import React from 'react';
import type { Deal } from '../../types';
import './DealList.css';

interface DealListProps {
  deals: Deal[];
  isLoading: boolean;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const DealList: React.FC<DealListProps> = ({
  deals,
  isLoading,
  onEdit,
  onView,
  onDelete,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'var(--success-color)';
      case 'lost':
        return 'var(--danger-color)';
      case 'negotiation':
        return 'var(--warning-color)';
      case 'proposal':
        return 'var(--info-color)';
      case 'qualification':
        return 'var(--secondary-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="deals-list-loading">
        <div className="spinner"></div>
        <p>Loading deals...</p>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="deals-list-empty">
        <div className="empty-icon">📊</div>
        <h3>No deals found</h3>
        <p>Start by creating your first deal to track your sales pipeline.</p>
      </div>
    );
  }

  return (
    <div className="deals-list">
      <div className="deals-table">
        <div className="table-header">
          <div className="header-cell">Deal</div>
          <div className="header-cell">Contact</div>
          <div className="header-cell">Value</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Probability</div>
          <div className="header-cell">Expected Close</div>
          <div className="header-cell">Assigned To</div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {deals.map((deal) => (
            <div key={deal.id} className="table-row">
              <div className="table-cell deal-info">
                <div className="deal-name" onClick={() => onView(deal)}>
                  {deal.title}
                </div>
                <div className="deal-description">{deal.description}</div>
              </div>
              
              <div className="table-cell contact-info">
                {deal.contact ? (
                  <div>
                    <div className="contact-name">{deal.contact.firstName} {deal.contact.lastName}</div>
                    <div className="contact-company">{deal.contact.company}</div>
                  </div>
                ) : (
                  <span className="no-contact">No contact</span>
                )}
              </div>
              
              <div className="table-cell deal-value">
                <span className="value-amount">{formatCurrency(deal.value)}</span>
              </div>
              
              <div className="table-cell deal-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(deal.status) }}
                >
                  {getStatusText(deal.status)}
                </span>
              </div>
              
              <div className="table-cell deal-probability">
                <div className="probability-bar">
                  <div 
                    className="probability-fill"
                    style={{ width: `${deal.probability}%` }}
                  ></div>
                </div>
                <span className="probability-text">{deal.probability}%</span>
              </div>
              
              <div className="table-cell expected-close">
                {deal.expectedCloseDate ? (
                  <span className="close-date">{formatDate(deal.expectedCloseDate?.toISOString() || '')}</span>
                ) : (
                  <span className="no-date">Not set</span>
                )}
              </div>
              
              <div className="table-cell assigned-to">
                {deal.assignedTo ? (
                  <div className="user-info">
                    <div className="user-avatar">
                      {deal.assignedTo.firstName.charAt(0)}{deal.assignedTo.lastName.charAt(0)}
                    </div>
                    <div className="user-name">
                      {deal.assignedTo.firstName} {deal.assignedTo.lastName}
                    </div>
                  </div>
                ) : (
                  <span className="unassigned">Unassigned</span>
                )}
              </div>
              
              <div className="table-cell actions">
                <div className="action-buttons">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => onView(deal)}
                    title="View Deal"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => onEdit(deal)}
                    title="Edit Deal"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(deal)}
                    title="Delete Deal"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`btn btn-page ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="btn btn-outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DealList;
