import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchDeals, 
  createDeal, 
  updateDeal, 
  deleteDeal,
  setSelectedDeal,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setAssignedToFilter,
  setPage
} from '../store/slices/dealsSlice';
import DealForm from '../components/Deals/DealForm';
import DealKanban from '../components/Deals/DealKanban';
import DealFilters from '../components/Deals/DealFilters';
import DealAnalytics from '../components/Deals/DealAnalytics';
import DealPipeline from '../components/Deals/DealPipeline';
import DealList from '../components/Deals/DealList';
import './Deals.css';
import type { Deal } from '../types';

const Deals: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    deals, 
    selectedDeal, 
    isLoading, 
    error, 
    total, 
    page, 
    limit,
    searchTerm,
    statusFilter,
    assignedToFilter
  } = useAppSelector((state) => state.deals);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'pipeline' | 'list'>('kanban');

  useEffect(() => {
    dispatch(fetchDeals({ page, limit, search: searchTerm, status: statusFilter, assignedTo: assignedToFilter }));
  }, [dispatch, page, limit, searchTerm, statusFilter, assignedToFilter]);

  const handleCreateDeal = async (dealData: any) => {
    try {
      await dispatch(createDeal(dealData)).unwrap();
      setShowForm(false);
      dispatch(fetchDeals({ page, limit, search: searchTerm, status: statusFilter, assignedTo: assignedToFilter }));
    } catch (error) {
      console.error('Failed to create deal:', error);
    }
  };

  const handleUpdateDeal = async (dealData: any) => {
    if (!selectedDeal) return;
    
    try {
      await dispatch(updateDeal({ id: selectedDeal.id, data: dealData })).unwrap();
      setShowForm(false);
      setIsEditing(false);
      dispatch(setSelectedDeal(null));
      dispatch(fetchDeals({ page, limit, search: searchTerm, status: statusFilter, assignedTo: assignedToFilter }));
    } catch (error) {
      console.error('Failed to update deal:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setAssignedToFilter('');
    dispatch(setPage(1));
  };

  const handleDeleteDeal = async (deal: Deal) => {
    if (window.confirm(`Are you sure you want to delete "${deal.title}"?`)) {
      try {
        await dispatch(deleteDeal(deal.id)).unwrap();
        console.log('Deal deleted successfully');
        dispatch(fetchDeals({ page, limit, search: searchTerm, status: statusFilter, assignedTo: assignedToFilter }));
      } catch (error) {
        console.error('Failed to delete deal');
      }
    }
  };

  const handleEditDeal = (deal: any) => {
    dispatch(setSelectedDeal(deal));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewDeal = (deal: any) => {
    dispatch(setSelectedDeal(deal));
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    dispatch(setSelectedDeal(null));
  };

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handleAssignedToFilter = (assignedTo: string) => {
    dispatch(setAssignedToFilter(assignedTo));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(fetchDeals({ page: newPage, limit, search: searchTerm, status: statusFilter, assignedTo: assignedToFilter }));
  };

  if (error) {
    return (
      <div className="deals-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="deals-page">
      <div className="deals-header">
        <div className="header-content">
          <h1 className="deals-title">Deals Management</h1>
          <p className="deals-subtitle">Track and manage your sales pipeline</p>
        </div>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button 
              className={`btn ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </button>
            <button 
              className={`btn ${viewMode === 'pipeline' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('pipeline')}
            >
              Pipeline
            </button>
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Add New Deal
          </button>
        </div>
      </div>

      <div className="deals-content">
        <div className="deals-sidebar">
          <DealAnalytics />
        </div>
        
        <div className="deals-main">
          <DealFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            assignedToFilter={assignedToFilter}
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
            onAssignedToFilter={handleAssignedToFilter}
            onClearFilters={handleClearFilters}
          />
          
          {viewMode === 'kanban' && (
            <DealKanban
              deals={deals}
              isLoading={isLoading}
              onEdit={handleEditDeal}
              onView={handleViewDeal}
              onDelete={handleDeleteDeal}
              onUpdateStage={handleUpdateDeal}
            />
          )}
          
          {viewMode === 'pipeline' && (
            <DealPipeline
              deals={deals}
              isLoading={isLoading}
              onEdit={handleEditDeal}
              onView={handleViewDeal}
              onDelete={handleDeleteDeal}
            />
          )}
          
          {viewMode === 'list' && (
            <DealList
              deals={deals}
              isLoading={isLoading}
              onEdit={handleEditDeal}
              onView={handleViewDeal}
              onDelete={handleDeleteDeal}
              currentPage={page}
              totalPages={Math.ceil(total / limit)}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {showForm && (
        <DealForm
          deal={selectedDeal || undefined}
          isEditing={isEditing}
          onSubmit={isEditing ? handleUpdateDeal : handleCreateDeal}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Deals;
