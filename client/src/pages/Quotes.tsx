import { useState, useEffect } from 'react';

import QuoteList from '../components/Quotes/QuoteList';
import QuoteForm from '../components/Quotes/QuoteForm';
import QuoteAnalytics from '../components/Quotes/QuoteAnalytics';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchQuotes, createQuote, updateQuote, deleteQuote, setSelectedQuote, clearSelectedQuote } from '../store/slices/quotesSlice';
import { fetchContacts } from '../store/slices/contactsSlice';
import AccessibleButton from '../components/Accessibility/AccessibleButton';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import type { Quote } from '../types';
import './Quotes.css';

const Quotes = () => {
  const dispatch = useAppDispatch();
  const { quotes, selectedQuote, isLoading, error, page, limit } = useAppSelector((state) => state.quotes);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchQuotes({ page, limit }));
    dispatch(fetchContacts({ page: 1, limit: 1000 })); // Fetch all contacts for dropdowns
  }, [dispatch, page, limit]);

  const handleCreateQuote = () => {
    dispatch(clearSelectedQuote());
    setIsFormOpen(true);
  };

  const handleEditQuote = (quoteId: string) => {
    dispatch(setSelectedQuote(quotes.find((q: Quote) => q.id === quoteId) || null));
    setIsFormOpen(true);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      await dispatch(deleteQuote(quoteId));
      toast.success('Quote deleted successfully!');
    }
  };

  const handleSaveQuote = async (quoteData: any) => {
    if (selectedQuote) {
      await dispatch(updateQuote({ id: selectedQuote.id, data: quoteData }));
      toast.success('Quote updated successfully!');
    } else {
      await dispatch(createQuote(quoteData));
      toast.success('Quote created successfully!');
    }
    setIsFormOpen(false);
    dispatch(fetchQuotes({ page, limit })); // Refresh list
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    dispatch(clearSelectedQuote());
  };

  return (
    <div className="quotes-page-container">
      <div className="quotes-header">
        <h1 className="page-title">Quotes</h1>
        <AccessibleButton
          onClick={handleCreateQuote}
          variant="primary"
          ariaLabel="Create New Quote"
          icon={<PlusIcon className="w-5 h-5" />}
        >
          Create Quote
        </AccessibleButton>
      </div>

      <QuoteAnalytics 
        data={{
          totalQuotes: quotes.length,
          totalValue: quotes.reduce((sum, quote) => sum + quote.finalAmount, 0),
          averageValue: quotes.length > 0 ? quotes.reduce((sum, quote) => sum + quote.finalAmount, 0) / quotes.length : 0,
          conversionRate: 0.15,
          quotesByStatus: {
            DRAFT: quotes.filter(q => q.status === 'DRAFT').length,
            SENT: quotes.filter(q => q.status === 'SENT').length,
            VIEWED: quotes.filter(q => q.status === 'VIEWED').length,
            ACCEPTED: quotes.filter(q => q.status === 'ACCEPTED').length,
            REJECTED: quotes.filter(q => q.status === 'REJECTED').length,
            EXPIRED: quotes.filter(q => q.status === 'EXPIRED').length
          },
          monthlyTrends: [],
          topPerformingContacts: []
        }}
        dateRange="30d"
        onDateRangeChange={() => {}}
      />

      <div className="quotes-content">
        {isLoading && <p>Loading quotes...</p>}
        {error && <p className="error-message">Error: {error}</p>}
        {!isLoading && !error && (
          <QuoteList
            quotes={quotes}
            onEdit={(quote: Quote) => handleEditQuote(quote.id)}
            onDelete={handleDeleteQuote}
            onSend={() => {}}
            onAccept={() => {}}
            onReject={() => {}}
            loading={isLoading}
          />
        )}
      </div>

      {isFormOpen && (
        <QuoteForm
          quote={selectedQuote}
          onSave={handleSaveQuote}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Quotes;
