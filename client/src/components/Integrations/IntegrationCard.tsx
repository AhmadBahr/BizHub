import React from 'react';
import type { Integration } from '../../types';
import './IntegrationCard.css';

interface IntegrationCardProps {
  integration: Integration;
  isActive: boolean;
  onEdit: (integration: Integration) => void;
  onView: (integration: Integration) => void;
  onDelete: (id: string) => void;
  onToggle: (isActive: boolean) => void;
  onTest: (id: string) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  isActive,
  onEdit,
  onView,
  onDelete,
  onToggle,
  onTest
}) => {
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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (integration.status === 'available' || integration.status === 'connected') {
      onToggle(!isActive);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(integration);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${integration.name}?`)) {
      onDelete(integration.id);
    }
  };

  const handleTest = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTest(integration.id);
  };

  return (
    <div 
      className={`integration-card ${integration.status} ${isActive ? 'enabled' : ''}`}
      onClick={() => onView(integration)}
    >
      <div className="card-header">
        <div className="integration-icon">
          <span className="icon">{integration.icon}</span>
        </div>
        <div className="integration-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(integration.status) }}
          >
            {getStatusText(integration.status)}
          </span>
        </div>
      </div>

      <div className="card-content">
        <h3 className="integration-name">{integration.name}</h3>
        <p className="integration-description">{integration.description}</p>
        
        <div className="integration-category">
          <span 
            className="category-badge"
            style={{ backgroundColor: getCategoryColor(integration.category) }}
          >
            {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
          </span>
        </div>

        <div className="integration-features">
          <h4>Key Features:</h4>
          <ul>
            {integration.features.slice(0, 3).map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
            {integration.features.length > 3 && (
              <li className="more-features">
                +{integration.features.length - 3} more features
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="card-footer">
        {integration.status === 'coming-soon' ? (
          <button className="btn btn-secondary" disabled>
            Coming Soon
          </button>
        ) : (
          <div className="action-buttons">
            <button 
              className={`btn ${isActive ? 'btn-success' : 'btn-primary'}`}
              onClick={handleToggle}
            >
              {isActive ? 'Connected' : 'Connect'}
            </button>
            <button className="btn btn-outline" onClick={handleTest}>
              Test
            </button>
            <button className="btn btn-outline" onClick={handleEdit}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      {isActive && integration.status === 'connected' && (
        <div className="connection-indicator">
          <span className="indicator-dot"></span>
          <span className="indicator-text">Active</span>
        </div>
      )}

      {integration.lastTested && (
        <div className="last-tested">
          <small>Last tested: {new Date(integration.lastTested).toLocaleDateString()}</small>
        </div>
      )}
    </div>
  );
};

export default IntegrationCard;
