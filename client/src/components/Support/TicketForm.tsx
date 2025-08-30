import React, { useState, useEffect } from 'react';
import type { SupportTicket, Contact } from '../../types';
import './TicketForm.css';
import AccessibleButton from '../Accessibility/AccessibleButton';

interface TicketFormProps {
  ticket?: SupportTicket | null;
  onSave: (ticketData: Partial<SupportTicket>) => void;
  onCancel: () => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ ticket, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as SupportTicket['priority'],
    status: 'OPEN' as SupportTicket['status'],
    category: 'GENERAL' as SupportTicket['category'],
    contactId: '',
    assignedTo: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    setIsSubmitting(true);
    try {
      // Load contacts and users in parallel
      const [contactsResponse, usersResponse] = await Promise.all([
        fetch('/api/contacts'),
        fetch('/api/users')
      ]);
      
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData);
      }
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error loading form data:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        status: ticket.status,
        category: ticket.category,
        contactId: ticket.contactId || '',
        assignedTo: ticket.assignedTo || ''
      });
    }
  }, [ticket]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const ticketData: Partial<SupportTicket> = {
      ...formData,
      contactId: formData.contactId || undefined,
      assignedTo: formData.assignedTo || undefined
    };

    onSave(ticketData);
  };

  const getSelectedContact = () => {
    return contacts.find(contact => contact.id === formData.contactId);
  };

  const getSelectedUser = () => {
    return users.find(user => user.id === formData.assignedTo);
  };

  const isEditing = !!ticket;

  return (
    <div className="modal-overlay">
      <div className="modal-content ticket-form-modal">
        <div className="modal-header">
          <h2>{ticket ? 'Edit Ticket' : 'New Support Ticket'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className="ticket-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter ticket title"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the issue or request"
                  rows={4}
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            <div className="form-section">
              <h3>Classification</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
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
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="GENERAL">General</option>
                  <option value="TECHNICAL">Technical</option>
                  <option value="BILLING">Billing</option>
                  <option value="FEATURE_REQUEST">Feature Request</option>
                  <option value="BUG_REPORT">Bug Report</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h3>Assignment</h3>
              
              <div className="form-group">
                <label htmlFor="contactId">Contact</label>
                <select
                  id="contactId"
                  name="contactId"
                  value={formData.contactId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} - {contact.company}
                    </option>
                  ))}
                </select>
                {formData.contactId && getSelectedContact() && (
                  <div className="contact-summary">
                    <div className="contact-info">
                      <strong>{getSelectedContact()?.firstName} {getSelectedContact()?.lastName}</strong>
                      <div>{getSelectedContact()?.email}</div>
                      <div>{getSelectedContact()?.company}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="assignedTo">Assign To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))}
                </select>
                {formData.assignedTo && getSelectedUser() && (
                  <div className="user-summary">
                    <div className="user-info">
                      <strong>{getSelectedUser()?.firstName} {getSelectedUser()?.lastName}</strong>
                      <div>{getSelectedUser()?.email}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.priority || !formData.status}
            >
              {isEditing ? 'Update Ticket' : 'Create Ticket'}
            </AccessibleButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
