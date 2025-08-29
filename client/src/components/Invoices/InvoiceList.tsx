import React from 'react';
import type { Invoice } from '../../types';
import './InvoiceList.css';

interface InvoiceListProps {
  invoices: Invoice[];
  loading?: boolean;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  loading = false,
  onEdit,
  onDelete,
  onSend,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Draft', className: 'badge-draft' },
      SENT: { label: 'Sent', className: 'badge-sent' },
      PAID: { label: 'Paid', className: 'badge-paid' },
      OVERDUE: { label: 'Overdue', className: 'badge-overdue' },
      CANCELLED: { label: 'Cancelled', className: 'badge-cancelled' },
      PARTIAL: { label: 'Partial', className: 'badge-partial' },
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

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading invoices...</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-file-invoice-dollar"></i>
        <h3>No Invoices Found</h3>
        <p>Create your first invoice to get started.</p>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      <div className="table-container">
        <table className="invoices-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Title</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <span className="invoice-number">{invoice.invoiceNumber}</span>
                </td>
                <td>
                  <div className="invoice-title">
                    <strong>{invoice.title}</strong>
                    {invoice.description && (
                      <p className="invoice-description">{invoice.description}</p>
                    )}
                  </div>
                </td>
                <td>
                  {invoice.contact ? (
                    <div className="contact-info">
                      <span>{invoice.contact.firstName} {invoice.contact.lastName}</span>
                      {invoice.contact.company && (
                        <small>{invoice.contact.company}</small>
                      )}
                    </div>
                  ) : (
                    <span className="no-contact">No contact</span>
                  )}
                </td>
                <td>{getStatusBadge(invoice.status)}</td>
                <td>
                  <span className="amount">{formatCurrency(invoice.finalAmount, invoice.currency)}</span>
                </td>
                <td>
                  {invoice.dueDate ? (
                    <div className="due-date-info">
                      <span className="due-date">{formatDate(invoice.dueDate)}</span>
                      {invoice.status === 'OVERDUE' && (
                        <small className="overdue-days">
                          {getDaysOverdue(invoice.dueDate)} days overdue
                        </small>
                      )}
                    </div>
                  ) : (
                    <span className="no-date">No due date</span>
                  )}
                </td>
                <td>
                  <span className="created-date">{formatDate(invoice.createdAt)}</span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(invoice)}
                      title="Edit Invoice"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    
                    {invoice.status === 'DRAFT' && (
                      <button
                        className="btn-icon btn-success"
                        onClick={() => onSend(invoice.id)}
                        title="Send Invoice"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    )}
                    
                    <button
                      className="btn-icon btn-info"
                      title="View Invoice"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => onDelete(invoice.id)}
                      title="Delete Invoice"
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

export default InvoiceList;
