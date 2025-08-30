import React, { useState, useEffect } from 'react';
import type { Invoice, InvoiceLineItem, Contact, Quote } from '../../types';
import './InvoiceForm.css';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSave: (invoiceData: Partial<Invoice>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT' as Invoice['status'],
    subtotal: 0,
    taxAmount: 0,
    finalAmount: 0,
    currency: 'USD',
    dueDate: '',
    terms: '',
    notes: '',
    contactId: '',
    quoteId: '',
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (invoice) {
      setFormData({
        title: invoice.title || '',
        description: invoice.description || '',
        status: invoice.status,
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.taxAmount || 0,
        finalAmount: invoice.finalAmount || 0,
        currency: invoice.currency || 'USD',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        terms: invoice.terms || '',
        notes: invoice.notes || '',
        contactId: invoice.contactId || '',
        quoteId: invoice.quoteId || '',
      });
      setLineItems(invoice.lineItems || []);
    }
    // Load contacts and quotes
    loadContacts();
    loadQuotes();
  }, [invoice]);

  const loadContacts = async () => {
    try {
      // This would fetch contacts from the backend
      // const response = await apiService.getData<Contact[]>('/contacts');
      // setContacts(response);
      setContacts([]); // Empty for now, will be populated when API is ready
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const loadQuotes = async () => {
    try {
      // This would fetch quotes from the backend
      // const response = await apiService.getData<Quote[]>('/quotes');
      // setQuotes(response);
      setQuotes([]); // Empty for now, will be populated when API is ready
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const addLineItem = () => {
    const newLineItem: InvoiceLineItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: '',
    };
    setLineItems(prev => [...prev, newLineItem]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Calculate total for this line item
    const item = updatedItems[index];
    item.total = item.quantity * item.unitPrice;

    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const removeLineItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    calculateTotals(updatedItems);
  };

  const calculateTotals = (items: InvoiceLineItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * 0.1; // 10% tax rate
    const finalAmount = subtotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subtotal: subtotal,
      taxAmount: taxAmount,
      finalAmount: finalAmount,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      lineItems,
    } as Partial<Invoice>);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content invoice-form-modal">
        <div className="modal-header">
          <h2>{invoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-grid">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Invoice Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="PAID">Paid</option>
                    <option value="OVERDUE">Overdue</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="PARTIAL">Partial</option>
                  </select>
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

              <div className="form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Relations</h3>
              
              <div className="form-group">
                <label htmlFor="contactId">Contact</label>
                <select
                  id="contactId"
                  name="contactId"
                  value={formData.contactId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quoteId">Related Quote</label>
                <select
                  id="quoteId"
                  name="quoteId"
                  value={formData.quoteId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Quote</option>
                  {quotes.map(quote => (
                    <option key={quote.id} value={quote.id}>
                      {quote.quoteNumber} - {quote.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Line Items</h3>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={addLineItem}
            >
              <i className="fas fa-plus"></i>
              Add Line Item
            </button>

            <div className="line-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>${item.total.toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => removeLineItem(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-section">
            <h3>Totals</h3>
            <div className="totals-grid">
              <div className="total-item">
                <span>Subtotal:</span>
                <span>${formData.subtotal.toFixed(2)}</span>
              </div>
              <div className="total-item">
                <span>Tax:</span>
                <span>${formData.taxAmount.toFixed(2)}</span>
              </div>
              <div className="total-item total-final">
                <span>Final Amount:</span>
                <span>${formData.finalAmount.toFixed(2)}</span>
              </div>
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
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="terms">Terms & Conditions</label>
              <textarea
                id="terms"
                name="terms"
                value={formData.terms}
                onChange={handleInputChange}
                rows={4}
              />
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
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
