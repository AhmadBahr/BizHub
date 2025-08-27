import React from 'react';
import type { Deal } from '../../types';
import './DealPipeline.css';

interface DealPipelineProps {
  deals: Deal[];
  isLoading: boolean;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
}

const DealPipeline: React.FC<DealPipelineProps> = ({
  deals,
  isLoading,
  onEdit,
  onView,
  onDelete
}) => {
  const stages = [
    { key: 'Prospecting', label: 'Prospecting', color: '#3b82f6', icon: '🎯' },
    { key: 'Qualification', label: 'Qualification', color: '#8b5cf6', icon: '📋' },
    { key: 'Proposal', label: 'Proposal', color: '#f59e0b', icon: '📄' },
    { key: 'Negotiation', label: 'Negotiation', color: '#ec4899', icon: '🤝' },
    { key: 'Closed Won', label: 'Closed Won', color: '#10b981', icon: '✅' },
    { key: 'Closed Lost', label: 'Closed Lost', color: '#6b7280', icon: '❌' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDealsForStage = (stage: string) => {
    return deals.filter(deal => deal.status === stage);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return '#10b981';
    if (probability >= 60) return '#f59e0b';
    if (probability >= 40) return '#f97316';
    return '#ef4444';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': '#10b981',
      'On Hold': '#f59e0b',
      'Lost': '#ef4444',
      'Won': '#10b981'
    };
    return colors[status] || '#6b7280';
  };

  if (isLoading) {
    return (
      <div className="deal-pipeline-loading">
        <div className="loading-spinner"></div>
        <p>Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="deal-pipeline">
      <div className="pipeline-header">
        <h3>Sales Pipeline</h3>
        <p>Visual representation of your sales funnel and deal progression</p>
      </div>

      <div className="pipeline-container">
        {stages.map((stage, index) => {
          const stageDeals = getDealsForStage(stage.key);
          const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          const avgProbability = stageDeals.length > 0 
            ? stageDeals.reduce((sum, deal) => sum + (deal.probability || 0), 0) / stageDeals.length
            : 0;
          
          return (
            <div key={stage.key} className="pipeline-stage">
              <div className="stage-header" style={{ borderLeftColor: stage.color }}>
                <div className="stage-info">
                  <div className="stage-title">
                    <span className="stage-icon">{stage.icon}</span>
                    <span className="stage-label">{stage.label}</span>
                  </div>
                  <div className="stage-stats">
                    <span className="deal-count">{stageDeals.length} deals</span>
                    <span className="deal-value">{formatCurrency(totalValue)}</span>
                  </div>
                  {stageDeals.length > 0 && (
                    <div className="stage-probability">
                      <span className="probability-label">Avg Probability:</span>
                      <span 
                        className="probability-value"
                        style={{ color: getProbabilityColor(avgProbability) }}
                      >
                        {avgProbability.toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {index < stages.length - 1 && (
                  <div className="stage-arrow">
                    <span>→</span>
                  </div>
                )}
              </div>

              <div className="stage-deals">
                {stageDeals.map(deal => (
                  <div key={deal.id} className="pipeline-deal">
                    <div className="deal-header">
                      <h4 className="deal-title">{deal.title}</h4>
                      <div className="deal-actions">
                        <button
                          className="action-btn view-btn"
                          onClick={() => onView(deal)}
                          title="View Deal"
                        >
                          👁️
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => onEdit(deal)}
                          title="Edit Deal"
                        >
                          ✏️
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => onDelete(deal)}
                          title="Delete Deal"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="deal-details">
                      <div className="deal-contact">
                        {deal.contact?.firstName} {deal.contact?.lastName}
                        {deal.contact?.company && (
                          <span className="deal-company"> • {deal.contact.company}</span>
                        )}
                      </div>
                      
                      <div className="deal-metrics">
                        <span className="deal-value">
                          💰 {formatCurrency(deal.value || 0)}
                        </span>
                        <span 
                          className="deal-probability"
                          style={{ color: getProbabilityColor(deal.probability || 0) }}
                        >
                          🎯 {deal.probability || 0}%
                        </span>
                      </div>

                      <div className="deal-status">
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(deal.status || 'Active') }}
                        >
                          {deal.status || 'Active'}
                        </span>
                      </div>

                      {deal.expectedCloseDate && (
                        <div className="deal-due-date">
                          📅 {new Date(deal.expectedCloseDate).toLocaleDateString()}
                        </div>
                      )}

                      {deal.tags && deal.tags.length > 0 && (
                        <div className="deal-tags">
                          {deal.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                          {deal.tags.length > 2 && (
                            <span className="tag-more">+{deal.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="empty-stage">
                    <span className="empty-icon">📭</span>
                    <p>No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pipeline-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-label">Total Pipeline Value:</span>
            <span className="stat-value">
              {formatCurrency(deals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
            </span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Total Deals:</span>
            <span className="stat-value">{deals.length}</span>
          </div>
          <div className="summary-stat">
            <span className="stat-label">Average Deal Size:</span>
            <span className="stat-value">
              {deals.length > 0 
                ? formatCurrency(deals.reduce((sum, deal) => sum + (deal.value || 0), 0) / deals.length)
                : '$0'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealPipeline;
