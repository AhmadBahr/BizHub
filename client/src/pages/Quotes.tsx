import React, { useState, useEffect } from 'react';
import QuoteForm from '../components/Quotes/QuoteForm';
import QuoteList from '../components/Quotes/QuoteList';
import QuoteTemplateForm from '../components/Quotes/QuoteTemplateForm';
import QuoteAnalytics from '../components/Quotes/QuoteAnalytics';
import { quotesApi, quoteTemplatesApi, contactsApi } from '../services';
import type { Quote, QuoteTemplate, Contact } from '../types';

const Quotes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quotes' | 'templates' | 'analytics'>('quotes');
  const [showForm, setShowForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<QuoteTemplate | null>(null);
  const [dateRange, setDateRange] = useState('30d');
  
  // Real data state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);
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
      // Load quotes, templates, contacts, and analytics in parallel
      const [quotesResponse, templatesResponse, contactsResponse, analyticsResponse] = await Promise.all([
        quotesApi.getQuotes(),
        quoteTemplatesApi.getTemplates(),
        contactsApi.getContacts(),
        quotesApi.getQuoteAnalytics()
      ]);

      if (quotesResponse.success) setQuotes(quotesResponse.data);
      if (templatesResponse.success) setTemplates(templatesResponse.data);
      if (contactsResponse.success) setContacts(contactsResponse.data);
      if (analyticsResponse.success) setAnalytics(analyticsResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuote = () => {
    setEditingQuote(null);
    setShowForm(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingQuote(null);
  };

  const handleSaveQuote = async (quoteData: Partial<Quote>) => {
    try {
      setLoading(true);
      
      if (editingQuote) {
        // Update existing quote
        const response = await quotesApi.updateQuote(editingQuote.id, quoteData);
        if (response.success) {
          setQuotes(quotes.map(q => 
            q.id === editingQuote.id ? response.data : q
          ));
        }
      } else {
        // Create new quote
        const response = await quotesApi.createQuote(quoteData);
        if (response.success) {
          setQuotes([...quotes, response.data]);
        }
      }
      
      setShowForm(false);
      setEditingQuote(null);
      // Reload analytics after changes
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quote');
      console.error('Error saving quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        setLoading(true);
        const response = await quotesApi.deleteQuote(id);
        if (response.success) {
          setQuotes(quotes.filter(q => q.id !== id));
          loadData(); // Reload analytics
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete quote');
        console.error('Error deleting quote:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendQuote = async (id: string) => {
    try {
      setLoading(true);
      const response = await quotesApi.sendQuote(id);
      if (response.success) {
        setQuotes(quotes.map(q => 
          q.id === id ? response.data : q
        ));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send quote');
      console.error('Error sending quote:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (id: string) => {
    try {
      // dispatch(acceptQuote(id));
      console.log('Accepting quote:', id);
    } catch (error) {
      console.error('Error accepting quote:', error);
    }
  };

  const handleRejectQuote = async (id: string) => {
    try {
      // dispatch(rejectQuote(id));
      console.log('Rejecting quote:', id);
    } catch (error) {
      console.error('Error rejecting quote:', error);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowTemplateForm(true);
  };

  const handleEditTemplate = (template: QuoteTemplate) => {
    setEditingTemplate(template);
    setShowTemplateForm(true);
  };

  const handleCloseTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async (templateData: Partial<QuoteTemplate>) => {
    try {
      setLoading(true);
      
      if (editingTemplate) {
        // Update existing template
        const response = await quoteTemplatesApi.updateTemplate(editingTemplate.id, templateData);
        if (response.success) {
          setTemplates(templates.map(t => 
            t.id === editingTemplate.id ? response.data : t
          ));
        }
      } else {
        // Create new template
        const response = await quoteTemplatesApi.createTemplate(templateData);
        if (response.success) {
          setTemplates([...templates, response.data]);
        }
      }
      
      handleCloseTemplateForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      console.error('Error saving template:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quotes-page">
      <div className="page-header">
        <h1>Quote & Proposal Management</h1>
        <div className="header-actions">
          {activeTab === 'quotes' && (
            <button
              className="btn btn-primary"
              onClick={handleCreateQuote}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              New Quote
            </button>
          )}
          {activeTab === 'templates' && (
            <button
              className="btn btn-primary"
              onClick={handleCreateTemplate}
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
              New Template
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
          className={`tab ${activeTab === 'quotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quotes')}
        >
          Quotes
        </button>
        <button
          className={`tab ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'quotes' && (
          <div className="quotes-tab">
            <QuoteList
              quotes={quotes}
              loading={loading}
              onEdit={handleEditQuote}
              onDelete={handleDeleteQuote}
              onSend={handleSendQuote}
              onAccept={handleAcceptQuote}
              onReject={handleRejectQuote}
            />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="templates-tab">
            <div className="templates-list">
              <div className="templates-header">
                <h3>Quote Templates</h3>
                <p>Manage your reusable quote templates</p>
              </div>
              <div className="templates-grid">
                {templates.map((template) => (
                  <div key={template.id} className="template-card">
                    <div className="template-header">
                      <h4>{template.name}</h4>
                      <span className={`status-badge ${template.isActive ? 'active' : 'inactive'}`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="template-description">{template.description}</p>
                    <div className="template-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditTemplate(template)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <i className="fas fa-copy"></i>
                        Duplicate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <QuoteAnalytics
              data={analytics}
              loading={loading}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
        )}
      </div>

      {showForm && (
        <QuoteForm
          quote={editingQuote}
          onSave={handleSaveQuote}
          onCancel={handleCloseForm}
          loading={loading}
        />
      )}

      {showTemplateForm && (
        <QuoteTemplateForm
          template={editingTemplate || undefined}
          onSave={handleSaveTemplate}
          onCancel={handleCloseTemplateForm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Quotes;
