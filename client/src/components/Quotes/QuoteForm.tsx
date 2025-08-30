import React, { useState, useEffect } from 'react';
import type { Quote, QuoteLineItem, Contact, Deal } from '../../types';
import './QuoteForm.css';

interface QuoteFormProps {
  quote?: Quote | null;
  onSave: (quoteData: Partial<Quote>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({
  quote,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'DRAFT' as Quote['status'],
    subtotal: 0,
    taxAmount: 0,
    finalAmount: 0,
    currency: 'USD',
    validUntil: '',
    notes: '',
    terms: '',
    contactId: '',
    dealId: '',
  });

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (quote) {
      setFormData({
        title: quote.title || '',
        description: quote.description || '',
        status: quote.status,
        subtotal: quote.subtotal || 0,
        taxAmount: quote.taxAmount || 0,
        finalAmount: quote.finalAmount || 0,
        currency: quote.currency || 'USD',
        validUntil: quote.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : '',
        notes: quote.notes || '',
        terms: quote.terms || '',
        contactId: quote.contactId || '',
        dealId: quote.dealId || '',
      });
      setLineItems(quote.lineItems || []);
    }
    // Load contacts and deals
    loadContacts();
    loadDeals();
  }, [quote]);

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

  const loadDeals = async () => {
    try {
      // This would fetch deals from the backend
      // const response = await apiService.getData<Deal[]>('/deals');
      // setDeals(response);
      setDeals([]); // Empty for now, will be populated when API is ready
    } catch (error) {
      console.error('Failed to load deals:', error);
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
    const newLineItem: QuoteLineItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
      notes: '',
    };
    setLineItems(prev => [...prev, newLineItem]);
  };

  const updateLineItem = (index: number, field: keyof QuoteLineItem, value: any) => {
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

  const calculateTotals = (items: QuoteLineItem[]) => {
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
    } as Partial<Quote>);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content quote-form-modal">
        <div className="modal-header">
          <h2>{quote ? 'Edit Quote' : 'Create New Quote'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quote-form">
          <div className="form-grid">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Quote Title *</label>
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
                    <option value="VIEWED">Viewed</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="EXPIRED">Expired</option>
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
                <label htmlFor="validUntil">Valid Until</label>
                <input
                  type="date"
                  id="validUntil"
                  name="validUntil"
                  value={formData.validUntil}
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
                <label htmlFor="dealId">Deal</label>
                <select
                  id="dealId"
                  name="dealId"
                  value={formData.dealId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Deal</option>
                  {deals.map(deal => (
                    <option key={deal.id} value={deal.id}>
                      {deal.title} - ${deal.value}
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
              {loading ? 'Saving...' : (quote ? 'Update Quote' : 'Create Quote')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteForm;
