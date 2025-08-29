import React, { useState, useEffect } from 'react';
import type { Payment, Invoice } from '../../types';
import './PaymentForm.css';

interface PaymentFormProps {
  payment?: Payment | null;
  onSave: (paymentData: Partial<Payment>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'USD',
    paymentMethod: 'CREDIT_CARD' as Payment['paymentMethod'],
    status: 'COMPLETED' as Payment['status'],
    transactionId: '',
    notes: '',
    paymentDate: new Date().toISOString().split('T')[0],
    invoiceId: '',
  });

  const [invoices] = useState<Invoice[]>([]);

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount || 0,
        currency: payment.currency || 'USD',
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        transactionId: payment.transactionId || '',
        notes: payment.notes || '',
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        invoiceId: payment.invoiceId || '',
      });
    }
    // Load invoices
    // loadInvoices();
  }, [payment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Partial<Payment>);
  };

  const getSelectedInvoice = () => {
    return invoices.find(invoice => invoice.id === formData.invoiceId);
  };

  const selectedInvoice = getSelectedInvoice();

  return (
    <div className="modal-overlay">
      <div className="modal-content payment-form-modal">
        <div className="modal-header">
          <h2>{payment ? 'Edit Payment' : 'Record New Payment'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-grid">
            <div className="form-section">
              <h3>Payment Details</h3>
              
              <div className="form-group">
                <label htmlFor="invoiceId">Invoice *</label>
                <select
                  id="invoiceId"
                  name="invoiceId"
                  value={formData.invoiceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Invoice</option>
                  {invoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.title} (${invoice.finalAmount})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="invoice-summary">
                  <h4>Invoice Summary</h4>
                  <div className="summary-item">
                    <span>Invoice Number:</span>
                    <span>{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="summary-item">
                    <span>Title:</span>
                    <span>{selectedInvoice.title}</span>
                  </div>
                  <div className="summary-item">
                    <span>Total Amount:</span>
                    <span>${selectedInvoice.finalAmount.toFixed(2)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Status:</span>
                    <span className={`status-badge ${selectedInvoice.status.toLowerCase()}`}>
                      {selectedInvoice.status}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="amount">Amount *</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="paymentMethod">Payment Method *</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                    <option value="CHECK">Check</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="paymentDate">Payment Date *</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="transactionId">Transaction ID</label>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="e.g., txn_123456789"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Information</h3>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={6}
                  placeholder="Add any additional notes about this payment..."
                />
              </div>

              <div className="payment-summary">
                <h4>Payment Summary</h4>
                <div className="summary-item">
                  <span>Amount:</span>
                  <span>${formData.amount.toFixed(2)} {formData.currency}</span>
                </div>
                <div className="summary-item">
                  <span>Method:</span>
                  <span>{formData.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="summary-item">
                  <span>Status:</span>
                  <span className={`status-badge ${formData.status.toLowerCase()}`}>
                    {formData.status}
                  </span>
                </div>
                <div className="summary-item">
                  <span>Date:</span>
                  <span>{formData.paymentDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (payment ? 'Update Payment' : 'Record Payment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
