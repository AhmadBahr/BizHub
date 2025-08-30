import React, { useState } from 'react';
import type { SupportTicket } from '../../types';
import './TicketList.css';
import AccessibleButton from '../Accessibility/AccessibleButton';

interface TicketListProps {
  tickets: SupportTicket[];
  onEdit: (ticket: SupportTicket) => void;
  onDelete: (ticketId: string) => void;
  onView: (ticket: SupportTicket) => void;
  isLoading?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({
  tickets,
  onEdit,
  onDelete,
  onView,
  isLoading = false
}) => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const getPriorityColor = (priority: SupportTicket['priority']) => {
    switch (priority) {
      case 'URGENT':
        return 'priority-urgent';
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const getStatusColor = (status: SupportTicket['status']) => {
    switch (status) {
      case 'OPEN':
        return 'status-open';
      case 'IN_PROGRESS':
        return 'status-progress';
      case 'RESOLVED':
        return 'status-resolved';
      case 'CLOSED':
        return 'status-closed';
      default:
        return 'status-open';
    }
  };

  const getCategoryIcon = (category: SupportTicket['category']) => {
    switch (category) {
      case 'TECHNICAL':
        return '🔧';
      case 'BILLING':
        return '💰';
      case 'GENERAL':
        return '📋';
      case 'FEATURE_REQUEST':
        return '💡';
      case 'BUG_REPORT':
        return '🐛';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="ticket-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-list-empty">
        <div className="empty-icon">📋</div>
        <h3>No tickets found</h3>
        <p>There are no support tickets to display.</p>
      </div>
    );
  }

  return (
    <div className="ticket-list">
      <div className="ticket-list-header">
        <h2>Support Tickets</h2>
        <span className="ticket-count">{tickets.length} tickets</span>
      </div>
      
      <div className="ticket-grid">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className={`ticket-card ${selectedTicket === ticket.id ? 'selected' : ''}`}
            onClick={() => setSelectedTicket(ticket.id)}
          >
            <div className="ticket-header">
              <div className="ticket-category">
                <span className="category-icon">{getCategoryIcon(ticket.category)}</span>
                <span className="category-name">{ticket.category.replace('_', ' ')}</span>
              </div>
              <div className="ticket-priority">
                <span className={`priority-badge ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
            </div>
            
            <div className="ticket-content">
              <h3 className="ticket-title" onClick={(e) => {
                e.stopPropagation();
                onView(ticket);
              }}>
                {ticket.title}
              </h3>
              <p className="ticket-description">
                {ticket.description.length > 100
                  ? `${ticket.description.substring(0, 100)}...`
                  : ticket.description
                }
              </p>
            </div>
            
            <div className="ticket-footer">
              <div className="ticket-status">
                <span className={`status-badge ${getStatusColor(ticket.status)}`}>
                  {ticket.status.replace('_', ' ')}
                </span>
              </div>
              <div className="ticket-meta">
                <span className="ticket-date">
                  {formatDate(ticket.createdAt)}
                </span>
                {ticket.contact && (
                  <span className="ticket-contact">
                    {ticket.contact.firstName} {ticket.contact.lastName}
                  </span>
                )}
              </div>
            </div>
            
            <div className="ticket-actions">
              <AccessibleButton
                onClick={(e) => {
                  e.stopPropagation();
                  onView(ticket);
                }}
                className="btn-view"
                aria-label={`View ticket ${ticket.title}`}
              >
                View
              </AccessibleButton>
              <AccessibleButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(ticket);
                }}
                className="btn-edit"
                aria-label={`Edit ticket ${ticket.title}`}
              >
                Edit
              </AccessibleButton>
              <AccessibleButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ticket.id);
                }}
                className="btn-delete"
                aria-label={`Delete ticket ${ticket.title}`}
              >
                Delete
              </AccessibleButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketList;
