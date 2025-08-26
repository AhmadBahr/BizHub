import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import './MetricsCard.css';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'info';
}

const MetricsCard: React.FC<MetricsCardProps> = ({ title, value, change, icon, color }) => {
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'success' : 'danger';

  return (
    <div className={`metrics-card metrics-card-${color}`}>
      <div className="metrics-card-header">
        <div className="metrics-icon">{icon}</div>
        <div className="metrics-change">
          <span className={`change-indicator ${changeColor}`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="change-icon" />
            ) : (
              <ArrowTrendingDownIcon className="change-icon" />
            )}
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      
      <div className="metrics-card-body">
        <h3 className="metrics-title">{title}</h3>
        <div className="metrics-value">{value}</div>
      </div>
    </div>
  );
};

export default MetricsCard;
