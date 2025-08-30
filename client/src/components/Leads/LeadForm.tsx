import React, { useState, useEffect } from 'react';
import type { Lead } from '../../types';
import './LeadForm.css';

interface LeadFormProps {
  lead?: Lead | null;
  isEditing: boolean;
  onSubmit: (data: Partial<Lead>) => void;
  onClose: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, isEditing, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    title: '',
    description: '',
    status: 'New',
    source: 'Website',
    value: 0,
    expectedCloseDate: new Date(),
    tags: [],
    notes: '',
    contactId: '',
    assignedToId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead) {
      setFormData({
        title: lead.title || '',
        description: lead.description || '',
        status: lead.status || 'New',
        source: lead.source || 'Website',
        score: lead.score || 50,
        value: lead.value || 0,
        expectedCloseDate: lead.expectedCloseDate ? new Date(lead.expectedCloseDate) : new Date(),
        notes: lead.notes || '',
        tags: lead.tags || [],
        contactId: lead.contactId || '',
        assignedToId: lead.assignedToId || ''
      });
    }
  }, [lead]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const score = parseInt(e.target.value);
    setFormData(prev => ({ ...prev, score }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.score && (formData.score < 0 || formData.score > 100)) {
      newErrors.score = 'Score must be between 0 and 100';
    }

    if (formData.value && formData.value < 0) {
      newErrors.value = 'Value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-81-100';
    if (score >= 60) return 'score-61-80';
    if (score >= 40) return 'score-41-60';
    if (score >= 20) return 'score-21-40';
    return 'score-0-20';
  };

  return (
    <div className="lead-form-overlay">
      <div className="lead-form">
        <div className="form-header">
          <h2 className="form-title">
            {isEditing ? 'Edit Lead' : 'Create New Lead'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                Title <span className="required">*</span>
              </label>
              <input
                type="text"
                name="title"
                className={`form-input ${errors.title ? 'error' : ''}`}
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter lead title"
              />
              {errors.title && <div className="error-message">⚠️ {errors.title}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Status <span className="required">*</span>
              </label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Source <span className="required">*</span>
              </label>
              <select
                name="source"
                className="form-select"
                value={formData.source}
                onChange={handleInputChange}
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Event">Event</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Value</label>
              <input
                type="number"
                name="value"
                className={`form-input ${errors.value ? 'error' : ''}`}
                value={formData.value}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
              />
              {errors.value && <div className="error-message">⚠️ {errors.value}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Expected Close Date</label>
              <input
                type="date"
                name="expectedCloseDate"
                className="form-input"
                value={formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact ID</label>
              <input
                type="text"
                name="contactId"
                className="form-input"
                value={formData.contactId}
                onChange={handleInputChange}
                placeholder="Enter contact ID"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To ID</label>
              <input
                type="text"
                name="assignedToId"
                className="form-input"
                value={formData.assignedToId}
                onChange={handleInputChange}
                placeholder="Enter assigned user ID"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter lead description"
                rows={4}
              />
              {errors.description && <div className="error-message">⚠️ {errors.description}</div>}
            </div>

            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                className="form-textarea"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter additional notes"
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">Tags</label>
              <input
                type="text"
                name="tags"
                className="form-input"
                value={formData.tags?.join(', ') || ''}
                onChange={handleTagsChange}
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="form-group full-width">
              <div className={`score-section ${getScoreClass(formData.score || 0)}`}>
                <label className="form-label">Lead Score</label>
                <div className="score-display">
                  <div 
                    className="score-value"
                    style={{ color: getScoreColor(formData.score || 0) }}
                  >
                    {formData.score}
                  </div>
                  <input
                    type="range"
                    name="score"
                    className="score-slider"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={handleScoreChange}
                    style={{ '--score-color': getScoreColor(formData.score || 0) } as React.CSSProperties}
                  />
                </div>
                <div className="score-labels">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
                {errors.score && <div className="error-message">⚠️ {errors.score}</div>}
              </div>
            </div>
          </div>

          <div className="form-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;
