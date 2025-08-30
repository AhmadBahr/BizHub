import React, { useState, useEffect } from 'react';
import InvoiceForm from '../components/Invoices/InvoiceForm';
import InvoiceList from '../components/Invoices/InvoiceList';
import PaymentForm from '../components/Invoices/PaymentForm';
import InvoiceAnalytics from '../components/Invoices/InvoiceAnalytics';
import { invoicesApi, paymentsApi, contactsApi } from '../services';
import type { Invoice, Payment, Contact } from '../types';
import './Invoices.css';

const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'analytics'>('invoices');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  
  // Real data state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load invoices, payments, contacts, and analytics in parallel
      const [invoicesResponse, paymentsResponse, contactsResponse, analyticsResponse] = await Promise.all([
        invoicesApi.getInvoices(),
        paymentsApi.getPayments(),
        contactsApi.getContacts(),
        invoicesApi.getInvoiceAnalytics()
      ]);

      if (invoicesResponse.success) setInvoices(invoicesResponse.data);
      if (paymentsResponse.success) setPayments(paymentsResponse.data);
      if (contactsResponse.success) setContacts(contactsResponse.data);
      if (analyticsResponse.success) setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleCloseInvoiceForm = () => {
    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      setLoading(true);
      
      if (editingInvoice) {
        // Update existing invoice
        const response = await invoicesApi.updateInvoice(editingInvoice.id, invoiceData);
        if (response.success) {
          setInvoices(invoices.map(i => 
            i.id === editingInvoice.id ? response.data : i
          ));
        }
      } else {
        // Create new invoice
        const response = await invoicesApi.createInvoice(invoiceData);
        if (response.success) {
          setInvoices([...invoices, response.data]);
        }
      }
      
      handleCloseInvoiceForm();
      // Reload analytics after changes
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
      console.error('Error saving invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        setLoading(true);
        const response = await invoicesApi.deleteInvoice(id);
        if (response.success) {
          setInvoices(invoices.filter(i => i.id !== id));
          loadData(); // Reload analytics
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete invoice');
        console.error('Error deleting invoice:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendInvoice = async (id: string) => {
    try {
      setLoading(true);
      const response = await invoicesApi.sendInvoice(id);
      if (response.success) {
        setInvoices(invoices.map(i => 
          i.id === id ? response.data : i
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
      console.error('Error sending invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = () => {
    setEditingPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleClosePaymentForm = () => {
    setShowPaymentForm(false);
    setEditingPayment(null);
  };

  const handleSavePayment = async (paymentData: Partial<Payment>) => {
    try {
      if (editingPayment) {
        // dispatch(updatePayment({ id: editingPayment.id, ...paymentData }));
        console.log('Updating payment:', paymentData);
      } else {
        // dispatch(createPayment(paymentData));
        console.log('Creating payment:', paymentData);
      }
      handleClosePaymentForm();
    } catch (error) {
      console.error('Error saving payment:', error);
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1>Invoice & Billing Management</h1>
        <div className="header-actions">
          {activeTab === 'invoices' && (
            <button
              className="btn btn-primary"
              onClick={handleCreateInvoice}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              New Invoice
            </button>
          )}
          {activeTab === 'payments' && (
            <button
              className="btn btn-primary"
              onClick={handleCreatePayment}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button 
            className="error-close" 
            onClick={() => setError(null)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            Loading...
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'invoices' && (
          <div className="invoices-tab">
            <InvoiceList
              invoices={invoices}
              loading={loading}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onSend={handleSendInvoice}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <div className="payments-list">
              <div className="payments-header">
                <h3>Payment Records</h3>
                <p>Track all payments and transactions</p>
              </div>
              <div className="payments-table">
                <table>
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Invoice</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>
                          <span className="payment-number">{payment.paymentNumber}</span>
                        </td>
                        <td>
                          <div className="invoice-info">
                            <span className="invoice-number">{payment.invoice?.invoiceNumber}</span>
                            <small>{payment.invoice?.title}</small>
                          </div>
                        </td>
                        <td>
                          <span className="amount">${payment.amount.toFixed(2)}</span>
                        </td>
                        <td>
                          <span className="payment-method">{payment.paymentMethod.replace('_', ' ')}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${payment.status.toLowerCase()}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td>
                          <span className="payment-date">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn-icon"
                              onClick={() => handleEditPayment(payment)}
                              title="Edit Payment"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <InvoiceAnalytics
              data={analytics}
              loading={loading}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        )}
      </div>

      {showInvoiceForm && (
        <InvoiceForm
          invoice={editingInvoice}
          onSave={handleSaveInvoice}
          onCancel={handleCloseInvoiceForm}
          loading={loading}
        />
      )}

      {showPaymentForm && (
        <PaymentForm
          payment={editingPayment}
          onSave={handleSavePayment}
          onCancel={handleClosePaymentForm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Invoices;
