import React from 'react';
import type { Quote } from '../../types';
import './QuoteList.css';

interface QuoteListProps {
  quotes: Quote[];
  loading?: boolean;
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  loading = false,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'badge-draft' },
      SENT: { label: 'Sent', className: 'badge-sent' },
      VIEWED: { label: 'Viewed', className: 'badge-viewed' },
      ACCEPTED: { label: 'Accepted', className: 'badge-accepted' },
      REJECTED: { label: 'Rejected', className: 'badge-rejected' },
      EXPIRED: { label: 'Expired', className: 'badge-expired' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading quotes...</p>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-file-invoice"></i>
        <h3>No Quotes Found</h3>
        <p>Create your first quote to get started.</p>
      </div>
    );
  }

  return (
    <div className="quote-list">
      <div className="table-container">
        <table className="quotes-table">
          <thead>
            <tr>
              <th>Quote Number</th>
              <th>Title</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Valid Until</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td>
                  <span className="quote-number">{quote.quoteNumber}</span>
                </td>
                <td>
                  <div className="quote-title">
                    <strong>{quote.title}</strong>
                    {quote.description && (
                      <p className="quote-description">{quote.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  {quote.contact ? (
                    <div className="contact-info">
                      <span>{quote.contact.firstName} {quote.contact.lastName}</span>
                      {quote.contact.company && (
                        <small>{quote.contact.company}</small>
                      )}
                    </div>
                  ) : (
                    <span className="no-contact">No contact</span>
                  )}
                </td>
                <td>{getStatusBadge(quote.status)}</td>
                <td>
                  <span className="amount">{formatCurrency(quote.finalAmount, quote.currency)}</span>
                </td>
                <td>
                  {quote.validUntil ? (
                    <span className="valid-until">{formatDate(quote.validUntil)}</span>
                  ) : (
                    <span className="no-date">No expiry</span>
                  )}
                </td>
                <td>
                  <span className="created-date">{formatDate(quote.createdAt)}</span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(quote)}
                      title="Edit Quote"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    {quote.status === 'DRAFT' && (
                      <button
                        className="btn-icon btn-success"
                        onClick={() => onSend(quote.id)}
                        title="Send Quote"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    )}
                    
                    {['SENT', 'VIEWED'].includes(quote.status) && (
                      <>
                        <button
                          className="btn-icon btn-success"
                          onClick={() => onAccept(quote.id)}
                          title="Accept Quote"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          className="btn-icon btn-warning"
                          onClick={() => onReject(quote.id)}
                          title="Reject Quote"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </>
                    )}
                    
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => onDelete(quote.id)}
                      title="Delete Quote"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteList;
