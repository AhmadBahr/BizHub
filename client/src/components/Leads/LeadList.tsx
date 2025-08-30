import React from 'react';
import type { Lead } from '../../types';
import './LeadList.css';

interface LeadListProps {
  leads: Lead[];
  isLoading: boolean;
  onEdit: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onUpdateScore: (lead: Lead, newScore: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const LeadList: React.FC<LeadListProps> = ({
  leads,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onUpdateScore,
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'New': '#3b82f6',
      'Contacted': '#8b5cf6',
      'Qualified': '#f59e0b',
      'Proposal': '#ec4899',
      'Negotiation': '#ef4444',
      'Closed Won': '#10b981',
      'Closed Lost': '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      'Website': '🌐',
      'Referral': '👥',
      'Social Media': '📱',
      'Email': '📧',
      'Phone': '📞',
      'Event': '🎪',
      'Cold Call': '☎️',
      'Other': '📋'
    };
    return icons[source] || '📋';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="lead-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  // Safety check for undefined leads
  if (!leads || leads.length === 0) {
    return (
      <div className="lead-list-empty">
        <span className="empty-icon">👥</span>
        <h3>No leads found</h3>
        <p>Create your first lead to get started</p>
      </div>
    );
  }

  return (
    <div className="lead-list">
      <div className="list-header">
        <div className="list-stats">
          <span className="total-leads">{leads?.length || 0} leads</span>
          <span className="qualified-leads">
            {leads?.filter(lead => lead.status === 'Qualified').length || 0} qualified
          </span>
        </div>
      </div>

      <div className="leads-container">
        {leads?.map(lead => (
          <div key={lead.id} className="lead-item">
            <div className="lead-main">
              <div className="lead-score" style={{ backgroundColor: getScoreColor(lead.score || 0) }}>
                {lead.score || 0}
              </div>
              
              <div className="lead-content">
                <div className="lead-header">
                  <h4 className="lead-title">{lead.title}</h4>
                  <div className="lead-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => onView(lead)}
                      title="View Lead"
                    >
                      👁️
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => onEdit(lead)}
                      title="Edit Lead"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => onDelete(lead)}
                      title="Delete Lead"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {lead.description && (
                  <p className="lead-description">{lead.description}</p>
                )}

                <div className="lead-meta">
                  <div className="lead-contact">
                    {lead.contact?.firstName} {lead.contact?.lastName}
                    {lead.contact?.company && (
                      <span className="lead-company"> • {lead.contact.company}</span>
                    )}
                  </div>
                  
                  <div className="lead-source">
                    {getSourceIcon(lead.source || 'Other')} {lead.source || 'Other'}
                  </div>
                  
                  {lead.value && (
                    <div className="lead-value">
                      💰 {formatCurrency(lead.value)}
                    </div>
                  )}
                </div>

                {lead.tags && lead.tags.length > 0 && (
                  <div className="lead-tags">
                    {lead.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lead-sidebar">
              <div className="lead-status">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(lead.status || 'New') }}
                >
                  {lead.status || 'New'}
                </span>
              </div>

              {lead.expectedCloseDate && (
                <div className="lead-due-date">
                  📅 {new Date(lead.expectedCloseDate).toLocaleDateString()}
                </div>
              )}

              {lead.assignedTo && (
                <div className="lead-assignee">
                  👤 {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                </div>
              )}

              <div className="lead-score-slider">
                <label htmlFor={`score-${lead.id}`}>Score:</label>
                <input
                  type="range"
                  id={`score-${lead.id}`}
                  min="0"
                  max="100"
                  value={lead.score || 0}
                  onChange={(e) => onUpdateScore(lead, parseInt(e.target.value))}
                  className="score-range"
                  style={{
                    '--score-color': getScoreColor(lead.score || 0)
                  } as React.CSSProperties}
                />
                <span className="score-value">{lead.score || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadList;
