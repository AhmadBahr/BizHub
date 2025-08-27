import React from 'react';
import type { Deal } from '../../types';
import './TopDeals.css';

interface TopDealsProps {
  deals: Deal[];
}

const TopDeals: React.FC<TopDealsProps> = ({ deals }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status: Deal['status']) => {
    const colors: Record<string, string> = {
      'Prospecting': 'warning',
      'Qualification': 'info',
      'Proposal': 'primary',
      'Negotiation': 'secondary',
      'Closed Won': 'success',
      'Closed Lost': 'danger'
    };
    return colors[status] || 'default';
  };

  if (!deals || deals.length === 0) {
    return (
      <div className="top-deals-empty">
        <p>No deals available</p>
      </div>
    );
  }

  return (
    <div className="top-deals">
      {deals.slice(0, 5).map((deal) => (
        <div key={deal.id} className="deal-item">
          <div className="deal-header">
            <div className="deal-title">{deal.title}</div>
            <div className={`deal-stage badge badge-${getStatusColor(deal.status)}`}>
              {deal.status.replace('-', ' ')}
            </div>
          </div>
          
          <div className="deal-details">
            <div className="deal-value">
              {formatCurrency(deal.value)}
            </div>
            <div className="deal-probability">
              {deal.probability}% probability
            </div>
          </div>
          
          <div className="deal-meta">
            <div className="deal-date">
              Expected: {new Date(deal.expectedCloseDate).toLocaleDateString()}
            </div>
            {deal.tags.length > 0 && (
              <div className="deal-tags">
                {deal.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="deal-tag">{tag}</span>
                ))}
                {deal.tags.length > 2 && (
                  <span className="deal-tag-more">+{deal.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopDeals;
