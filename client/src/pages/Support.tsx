import { useState, useEffect } from 'react';

import TicketList from '../components/Support/TicketList';
import TicketForm from '../components/Support/TicketForm';
import KnowledgeBase from '../components/Support/KnowledgeBase';
import SupportAnalytics from '../components/Support/SupportAnalytics';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { fetchTickets, createSupportTicket, updateSupportTicket, deleteSupportTicket, setSelectedTicket, clearSelectedTicket } from '../store/slices/supportSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import AccessibleButton from '../components/Accessibility/AccessibleButton';
import { PlusIcon, XMarkIcon, SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import type { SupportTicket } from '../types';
import './Support.css';

const Support = () => {
  const dispatch = useAppDispatch();
  const { tickets, selectedTicket, isLoading, error, page, limit, statusFilter, priorityFilter, assignedToFilter } = useAppSelector((state) => state.support);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledgeBase' | 'analytics'>('tickets');

  useEffect(() => {
    dispatch(fetchTickets({ page, limit, status: statusFilter, priority: priorityFilter, assignedTo: assignedToFilter }));
    dispatch(fetchUsers({ page: 1, limit: 1000 })); // Fetch all users for dropdowns
  }, [dispatch, page, limit, statusFilter, priorityFilter, assignedToFilter]);

  const handleCreateTicket = () => {
    dispatch(clearSelectedTicket());
    setIsFormOpen(true);
  };

  const handleEditTicket = (ticketId: string) => {
    dispatch(setSelectedTicket(tickets.find((t: SupportTicket) => t.id === ticketId) || null));
    setIsFormOpen(true);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      await dispatch(deleteSupportTicket(ticketId));
      toast.success('Ticket deleted successfully!');
    }
  };

  const handleSaveTicket = async (ticketData: any) => {
    if (selectedTicket) {
      await dispatch(updateSupportTicket({ id: selectedTicket.id, data: ticketData }));
      toast.success('Ticket updated successfully!');
    } else {
      await dispatch(createSupportTicket(ticketData));
      toast.success('Ticket created successfully!');
    }
    setIsFormOpen(false);
    dispatch(fetchTickets({ page, limit, status: statusFilter, priority: priorityFilter, assignedTo: assignedToFilter })); // Refresh list
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    dispatch(clearSelectedTicket());
  };

  return (
      <div className="support-page-container">
        <div className="support-header">
          <h1 className="page-title">Support Center</h1>
          <AccessibleButton
            onClick={handleCreateTicket}
            variant="primary"
            ariaLabel="Create New Support Ticket"
            icon={<PlusIcon className="w-5 h-5" />}
          >
            Create Ticket
          </AccessibleButton>
        </div>

        <div className="tabs">
          <AccessibleButton
            onClick={() => setActiveTab('tickets')}
            variant={activeTab === 'tickets' ? 'primary' : 'secondary'}
            ariaLabel="View Support Tickets"
            icon={<XMarkIcon className="w-5 h-5" />}
          >
            Tickets
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('knowledgeBase')}
            variant={activeTab === 'knowledgeBase' ? 'primary' : 'secondary'}
            ariaLabel="View Knowledge Base"
            icon={<SparklesIcon className="w-5 h-5" />}
          >
            Knowledge Base
          </AccessibleButton>
          <AccessibleButton
            onClick={() => setActiveTab('analytics')}
            variant={activeTab === 'analytics' ? 'primary' : 'secondary'}
            ariaLabel="View Support Analytics"
            icon={<ChartBarIcon className="w-5 h-5" />}
          >
            Analytics
          </AccessibleButton>
        </div>

        <div className="tab-content">
          {isLoading && <p>Loading data...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!isLoading && !error && activeTab === 'tickets' && (
            <TicketList
              tickets={tickets}
              onEdit={(ticket: SupportTicket) => handleEditTicket(ticket.id)}
              onDelete={handleDeleteTicket}
              onView={() => {}}
              isLoading={isLoading}
            />
          )}
          {!isLoading && !error && activeTab === 'knowledgeBase' && (
            <KnowledgeBase />
          )}
          {!isLoading && !error && activeTab === 'analytics' && (
            <SupportAnalytics tickets={tickets} />
          )}
        </div>

        {isFormOpen && (
          <TicketForm
            ticket={selectedTicket}
            onSave={handleSaveTicket}
            onCancel={handleCloseForm}
          />
        )}
      </div>
  );
};

export default Support;
