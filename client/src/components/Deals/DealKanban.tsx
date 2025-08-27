import React, { useState } from 'react';
import type { Deal } from '../../types';
import './DealKanban.css';

interface DealKanbanProps {
  deals: Deal[];
  isLoading: boolean;
  onEdit: (deal: Deal) => void;
  onView: (deal: Deal) => void;
  onDelete: (deal: Deal) => void;
  onUpdateStage: (deal: Deal, newStage: string) => void;
}

const DealKanban: React.FC<DealKanbanProps> = ({
  deals,
  isLoading,
  onEdit,
  onView,
  onDelete,
  onUpdateStage
}) => {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

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

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    
    if (draggedDeal && draggedDeal.status !== targetStage) {
      onUpdateStage(draggedDeal, targetStage);
    }
    
    setDraggedDeal(null);
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
      <div className="deal-kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="deal-kanban">
      <div className="kanban-header">
        <h3>Deal Pipeline</h3>
        <p>Drag and drop deals between stages to update their progress</p>
      </div>

      <div className="kanban-board">
        {stages.map(stage => {
          const stageDeals = getDealsForStage(stage.key);
          const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
          
          return (
            <div
              key={stage.key}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="column-header" style={{ borderLeftColor: stage.color }}>
                <div className="column-title">
                  <span className="column-icon">{stage.icon}</span>
                  <span className="column-label">{stage.label}</span>
                </div>
                <div className="column-stats">
                  <span className="deal-count">{stageDeals.length}</span>
                  <span className="deal-value">{formatCurrency(totalValue)}</span>
                </div>
              </div>

              <div className="column-content">
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="deal-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal)}
                  >
                    <div className="deal-header">
                      <div className="deal-title">{deal.title}</div>
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

                    <div className="deal-info">
                      <div className="deal-contact">
                        {deal.contact?.firstName} {deal.contact?.lastName}
                        {deal.contact?.company && (
                          <span className="deal-company"> • {deal.contact.company}</span>
                        )}
                      </div>
                      
                      <div className="deal-metrics">
                        <span 
                          className="deal-value"
                          title="Deal Value"
                        >
                          💰 {formatCurrency(deal.value || 0)}
                        </span>
                        <span 
                          className="deal-probability"
                          style={{ color: getProbabilityColor(deal.probability || 0) }}
                          title="Win Probability"
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
                          {deal.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))}
                          {deal.tags.length > 3 && (
                            <span className="tag-more">+{deal.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="empty-column">
                    <span className="empty-icon">📭</span>
                    <p>No deals in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealKanban;
