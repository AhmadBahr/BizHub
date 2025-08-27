import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchLeads, 
  createLead, 
  updateLead, 
  deleteLead, 
  updateLeadScore,
  setSelectedLead,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setSourceFilter,
  setPage
} from '../store/slices/leadsSlice';
import LeadForm from '../components/Leads/LeadForm';
import LeadList from '../components/Leads/LeadList';
import LeadFilters from '../components/Leads/LeadFilters';
import LeadAnalytics from '../components/Leads/LeadAnalytics';
import './Leads.css';
import type { Lead } from '../types';

const Leads: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    leads, 
    selectedLead, 
    isLoading, 
    error, 
    total, 
    page, 
    limit,
    searchTerm,
    statusFilter,
    sourceFilter
  } = useAppSelector((state) => state.leads);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchLeads({ page, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
  }, [dispatch, page, limit, searchTerm, statusFilter, sourceFilter]);

  const handleCreateLead = async (leadData: any) => {
    try {
      await dispatch(createLead(leadData)).unwrap();
      setShowForm(false);
      dispatch(fetchLeads({ page, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
    } catch (error) {
      console.error('Failed to create lead:', error);
    }
  };

  const handleUpdateLead = async (leadData: any) => {
    if (!selectedLead) return;
    
    try {
      await dispatch(updateLead({ id: selectedLead.id, data: leadData })).unwrap();
      setShowForm(false);
      setIsEditing(false);
      dispatch(setSelectedLead(null));
      dispatch(fetchLeads({ page, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
    } catch (error) {
      console.error('Failed to update lead:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setSourceFilter('');
    dispatch(setPage(1));
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete "${lead.title}"?`)) {
      try {
        await dispatch(deleteLead(lead.id)).unwrap();
        console.log('Lead deleted successfully');
        dispatch(fetchLeads({ page, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
      } catch (error) {
        console.error('Failed to delete lead');
      }
    }
  };

  const handleUpdateScore = async (lead: Lead, newScore: number) => {
    try {
      await dispatch(updateLeadScore({ id: lead.id, score: newScore })).unwrap();
      console.log('Lead score updated successfully');
      dispatch(fetchLeads({ page, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
    } catch (error) {
      console.error('Failed to update lead score');
    }
  };

  const handleEditLead = (lead: any) => {
    dispatch(setSelectedLead(lead));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewLead = (lead: any) => {
    dispatch(setSelectedLead(lead));
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    dispatch(setSelectedLead(null));
  };

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handleSourceFilter = (source: string) => {
    dispatch(setSourceFilter(source));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchLeads({ page: newPage, limit, search: searchTerm, status: statusFilter, source: sourceFilter }));
  };

  if (error) {
    return (
      <div className="leads-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div className="header-content">
          <h1 className="leads-title">Leads Management</h1>
          <p className="leads-subtitle">Track, manage, and convert your sales leads</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Add New Lead
          </button>
        </div>
      </div>

      <div className="leads-content">
        <div className="leads-sidebar">
          <LeadAnalytics />
        </div>
        
        <div className="leads-main">
          <LeadFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            sourceFilter={sourceFilter}
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
            onSourceFilter={handleSourceFilter}
            onClearFilters={handleClearFilters}
          />
          
          <LeadList
            leads={leads}
            isLoading={isLoading}
            onEdit={handleEditLead}
            onView={handleViewLead}
            onDelete={handleDeleteLead}
            onUpdateScore={handleUpdateScore}
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {showForm && (
        <LeadForm
          lead={selectedLead}
          isEditing={isEditing}
          onSubmit={isEditing ? handleUpdateLead : handleCreateLead}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Leads;
