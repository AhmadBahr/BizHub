import React, { useState, useEffect } from 'react';
import type { Deal, Contact, User } from '../../types';
import './DealForm.css';

interface DealFormProps {
  deal?: Partial<Deal>;
  isEditing: boolean;
  onSubmit: (deal: Partial<Deal>) => void;
  onClose: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ deal, isEditing, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Deal>>({
    title: '',
    description: '',
    status: 'OPPORTUNITY',
    value: 0,
    probability: 50,
    expectedCloseDate: '',
    notes: '',
    tags: [],
    contactId: '',
    assignedToId: '',
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        status: deal.status || 'OPPORTUNITY',
        value: deal.value || 0,
        probability: deal.probability || 50,
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
        notes: deal.notes || '',
        tags: deal.tags || [],
        contactId: deal.contactId || '',
        assignedToId: deal.assignedToId || '',
      });
    }
    
    // Load contacts and users
    loadContacts();
    loadUsers();
  }, [deal]);

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

  const loadUsers = async () => {
    try {
      // This would fetch users from the backend
      // const response = await apiService.getData<User[]>('/users');
      // setUsers(response);
      setUsers([]); // Empty for now, will be populated when API is ready
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'probability' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProbabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData(prev => ({
      ...prev,
      probability: Math.min(100, Math.max(0, value))
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(Boolean) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.contactId) {
      newErrors.contactId = 'Contact is required';
    }

    if ((formData.value || 0) < 0) {
      newErrors.value = 'Value must be positive';
    }

    if ((formData.probability || 0) < 0 || (formData.probability || 0) > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    if (formData.expectedCloseDate && new Date(formData.expectedCloseDate) < new Date()) {
      newErrors.expectedCloseDate = 'Expected close date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert form data to proper types
      const submitData: Partial<Deal> = {
        ...formData,
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : undefined,
        value: Number(formData.value),
        probability: Number(formData.probability),
      };
      
      onSubmit(submitData);
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return '#10b981';
    if (probability >= 60) return '#f59e0b';
    if (probability >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="deal-form-overlay">
      <div className="deal-form-modal">
        <div className="deal-form-header">
          <h2>{isEditing ? 'Edit Deal' : 'Create New Deal'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="deal-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Deal Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter deal title"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="value">Deal Value ($)</label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value || ''}
                onChange={handleInputChange}
                className={errors.value ? 'error' : ''}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.value && <span className="error-message">{errors.value}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'Prospecting'}
                onChange={handleInputChange}
              >
                <option value="Prospecting">Prospecting</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="expectedCloseDate">Expected Close Date</label>
              <input
                type="date"
                id="expectedCloseDate"
                name="expectedCloseDate"
                value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className={errors.expectedCloseDate ? 'error' : ''}
              />
              {errors.expectedCloseDate && <span className="error-message">{errors.expectedCloseDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="probability">Probability (%)</label>
              <div className="probability-input">
                <input
                  type="range"
                  id="probability"
                  name="probability"
                  value={formData.probability || 25}
                  onChange={handleProbabilityChange}
                  min="0"
                  max="100"
                  step="5"
                />
                <span 
                  className="probability-value"
                  style={{ color: getProbabilityColor(formData.probability || 25) }}
                >
                  {formData.probability || 25}%
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add any additional notes"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactId">Contact *</label>
              <select
                id="contactId"
                name="contactId"
                value={formData.contactId || ''}
                onChange={handleInputChange}
                className={errors.contactId ? 'error' : ''}
              >
                <option value="">Select a contact</option>
                {contacts.length > 0 ? (
                  contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.firstName} {contact.lastName} ({contact.email})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No contacts available</option>
                )}
              </select>
              {errors.contactId && <span className="error-message">{errors.contactId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="assignedToId">Assigned To</label>
              <select
                id="assignedToId"
                name="assignedToId"
                value={formData.assignedToId || ''}
                onChange={handleInputChange}
              >
                <option value="">Unassigned</option>
                {users.length > 0 ? (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No users available</option>
                )}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter deal description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="Enter tags separated by commas"
            />
            <small className="form-help">Separate tags with commas (e.g., hot lead, enterprise, urgent)</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealForm;
