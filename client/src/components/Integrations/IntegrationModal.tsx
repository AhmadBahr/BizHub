import React, { useState, useEffect } from 'react';
import type { Integration } from '../../types';
import './IntegrationModal.css';

interface IntegrationModalProps {
  integration?: Integration | null;
  isEditing: boolean;
  onSubmit: (integrationData: Partial<Integration>) => void;
  onClose: () => void;
}

const IntegrationModal: React.FC<IntegrationModalProps> = ({
  integration,
  isEditing,
  onSubmit,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'setup' | 'features' | 'form'>('overview');
  const [formData, setFormData] = useState<Partial<Integration>>({
    name: '',
    description: '',
    category: 'productivity',
    icon: '🔗',
    status: 'available',
    features: [],
    setupSteps: [],
    apiKey: '',
    isActive: false,
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        description: integration.description,
        category: integration.category,
        icon: integration.icon,
        status: integration.status,
        features: integration.features,
        setupSteps: integration.setupSteps,
        apiKey: integration.apiKey || '',
        isActive: integration.isActive,
      });
    }
  }, [integration]);

  const handleInputChange = (field: keyof Integration, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof Integration, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), value.trim()]
      }));
    }
  };

  const handleRemoveArrayItem = (field: keyof Integration, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'var(--success-color)';
      case 'available':
        return 'var(--primary-color)';
      case 'coming-soon':
        return 'var(--warning-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'available':
        return 'Available';
      case 'coming-soon':
        return 'Coming Soon';
      default:
        return status;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment':
        return 'var(--success-color)';
      case 'ecommerce':
        return 'var(--primary-color)';
      case 'marketing':
        return 'var(--warning-color)';
      case 'communication':
        return 'var(--info-color)';
      case 'analytics':
        return 'var(--purple-color)';
      case 'productivity':
        return 'var(--orange-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const renderOverview = () => (
    <div className="modal-overview">
      {integration ? (
        <>
          <div className="integration-header">
            <div className="integration-icon-large">
              <span className="icon">{integration.icon}</span>
            </div>
            <div className="integration-info">
              <h2>{integration.name}</h2>
              <p className="integration-description">{integration.description}</p>
              <div className="integration-meta">
                <span 
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(integration.category) }}
                >
                  {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(integration.status) }}
                >
                  {getStatusText(integration.status)}
                </span>
              </div>
            </div>
          </div>

          <div className="integration-features-preview">
            <h3>Key Features</h3>
            <div className="features-grid">
              {integration.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="no-integration">
          <h3>Create New Integration</h3>
          <p>Fill out the form to create a new integration.</p>
        </div>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="modal-setup">
      {integration ? (
        <>
          <h3>Setup Instructions</h3>
          <div className="setup-steps">
            {integration.setupSteps.map((step, index) => (
              <div key={index} className="setup-step">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <p>{step}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="setup-requirements">
            <h4>Requirements</h4>
            <ul>
              <li>Valid API key from {integration.name}</li>
              <li>Active {integration.name} account</li>
              <li>Internet connection for data sync</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="no-integration">
          <h3>Setup Instructions</h3>
          <p>Setup instructions will appear here after creating the integration.</p>
        </div>
      )}
    </div>
  );

  const renderFeatures = () => (
    <div className="modal-features">
      {integration ? (
        <>
          <h3>All Features</h3>
          <div className="features-list">
            {integration.features.map((feature, index) => (
              <div key={index} className="feature-detail">
                <span className="feature-icon">✓</span>
                <div className="feature-content">
                  <h4>{feature}</h4>
                  <p>Detailed description of how this feature works with {integration.name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-integration">
          <h3>Features</h3>
          <p>Features will appear here after creating the integration.</p>
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="modal-form">
      <h3>{isEditing ? 'Edit Integration' : 'Create Integration'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-input"
            rows={3}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="form-input"
              required
            >
              <option value="payment">Payment</option>
              <option value="ecommerce">E-commerce</option>
              <option value="marketing">Marketing</option>
              <option value="communication">Communication</option>
              <option value="analytics">Analytics</option>
              <option value="productivity">Productivity</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="icon">Icon</label>
            <input
              type="text"
              id="icon"
              value={formData.icon}
              onChange={(e) => handleInputChange('icon', e.target.value)}
              className="form-input"
              placeholder="🔗"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="form-input"
            required
          >
            <option value="available">Available</option>
            <option value="connected">Connected</option>
            <option value="coming-soon">Coming Soon</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            type="password"
            id="apiKey"
            value={formData.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            className="form-input"
            placeholder="Enter API key if available"
          />
        </div>

        <div className="form-group">
          <label>Features</label>
          <div className="array-input">
            <input
              type="text"
              placeholder="Add a feature"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayChange('features', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="form-input"
            />
            <div className="array-items">
              {(formData.features || []).map((feature, index) => (
                <span key={index} className="array-item">
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem('features', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Setup Steps</label>
          <div className="array-input">
            <input
              type="text"
              placeholder="Add a setup step"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleArrayChange('setupSteps', e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              className="form-input"
            />
            <div className="array-items">
              {(formData.setupSteps || []).map((step, index) => (
                <span key={index} className="array-item">
                  {step}
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem('setupSteps', index)}
                    className="remove-btn"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive || false}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Integration' : 'Create Integration'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="integration-modal-overlay" onClick={onClose}>
      <div className="integration-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-content">
          <div className="modal-tabs">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            {integration && (
              <>
                <button 
                  className={`tab-btn ${activeTab === 'setup' ? 'active' : ''}`}
                  onClick={() => setActiveTab('setup')}
                >
                  Setup
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'features' ? 'active' : ''}`}
                  onClick={() => setActiveTab('features')}
                >
                  Features
                </button>
              </>
            )}
            <button 
              className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => setActiveTab('form')}
            >
              {isEditing ? 'Edit' : 'Create'}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'setup' && renderSetup()}
            {activeTab === 'features' && renderFeatures()}
            {activeTab === 'form' && renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;
