import { useState, useEffect } from 'react';

import InvoiceList from '../components/Invoices/InvoiceList';
import InvoiceForm from '../components/Invoices/InvoiceForm';
import InvoiceAnalytics from '../components/Invoices/InvoiceAnalytics';
import PaymentForm from '../components/Invoices/PaymentForm';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchInvoices, createInvoice, updateInvoice, deleteInvoice, setSelectedInvoice, clearSelectedInvoice } from '../store/slices/invoicesSlice';
import { fetchContacts } from '../store/slices/contactsSlice';
import AccessibleButton from '../components/Accessibility/AccessibleButton';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import type { Invoice } from '../types';
import './Invoices.css';
import { apiService } from '../services/api';

const Invoices = () => {
  const dispatch = useAppDispatch();
  const { invoices, selectedInvoice, isLoading, error, page, limit } = useAppSelector((state) => state.invoices);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null); // State for analytics data
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30d'); // State for analytics date range

  useEffect(() => {
    dispatch(fetchInvoices({ page, limit }));
    dispatch(fetchContacts({ page: 1, limit: 1000 })); // Fetch all contacts for dropdowns
    // Fetch analytics data
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.get<any>(`/analytics/invoices?dateRange=${analyticsDateRange}`);
        if (response.success) {
          setAnalyticsData(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch invoice analytics:", err);
      }
    };
    fetchAnalytics();
  }, [dispatch, page, limit, analyticsDateRange]);

  const handleCreateInvoice = () => {
    dispatch(clearSelectedInvoice());
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    dispatch(setSelectedInvoice(invoice));
    setIsFormOpen(true);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      await dispatch(deleteInvoice(invoiceId));
      toast.success('Invoice deleted successfully!');
    }
  };

  const handleSaveInvoice = async (invoiceData: any) => {
    if (selectedInvoice) {
      await dispatch(updateInvoice({ id: selectedInvoice.id, data: invoiceData }));
      toast.success('Invoice updated successfully!');
    } else {
      await dispatch(createInvoice(invoiceData));
      toast.success('Invoice created successfully!');
    }
    setIsFormOpen(false);
    dispatch(fetchInvoices({ page, limit })); // Refresh list
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    dispatch(clearSelectedInvoice());
  };



  const handleClosePaymentForm = () => {
    setIsPaymentFormOpen(false);
    setPaymentInvoiceId(null);
  };

  const handleProcessPayment = (paymentData: any) => {
    console.log('Processing payment for invoice', paymentInvoiceId, paymentData);
    // Implement actual payment processing logic here
    toast.success('Payment processed successfully!');
    handleClosePaymentForm();
    dispatch(fetchInvoices({ page, limit })); // Refresh invoices to show updated payment status
  };

  return (
    <div className="invoices-page-container">
      <div className="invoices-header">
        <h1 className="page-title">Invoices</h1>
        <AccessibleButton
          onClick={handleCreateInvoice}
          variant="primary"
          ariaLabel="Create New Invoice"
          icon={<PlusIcon className="w-5 h-5" />}
        >
          Create Invoice
        </AccessibleButton>
      </div>

      <InvoiceAnalytics
        data={analyticsData || {}}
        dateRange={analyticsDateRange}
        onDateRangeChange={setAnalyticsDateRange}
      />

      <div className="invoices-content">
        {isLoading && <p>Loading invoices...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
                      <InvoiceList
              invoices={invoices}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onSend={() => {}}
              loading={isLoading}
            />
        )}
      </div>

      {isFormOpen && (
        <InvoiceForm
          invoice={selectedInvoice}
          onSave={handleSaveInvoice}
          onCancel={handleCloseForm}
        />
      )}

              {isPaymentFormOpen && paymentInvoiceId && (
          <PaymentForm
            onSave={handleProcessPayment}
            onCancel={handleClosePaymentForm}
          />
        )}
    </div>
  );
};

export default Invoices;
