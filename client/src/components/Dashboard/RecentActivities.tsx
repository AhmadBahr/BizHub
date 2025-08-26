import React from 'react';
import type { Activity } from '../../types';
import './RecentActivities.css';

interface RecentActivitiesProps {
  activities: Activity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call':
        return '📞';
      case 'email':
        return '📧';
      case 'meeting':
        return '🤝';
      case 'note':
        return '📝';
      case 'task':
        return '✅';
      default:
        return '📋';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="recent-activities-empty">
        <p>No recent activities</p>
      </div>
    );
  }

  return (
    <div className="recent-activities">
      {activities.slice(0, 5).map((activity) => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon">
            {getActivityIcon(activity.type)}
          </div>
          <div className="activity-content">
            <div className="activity-title">{activity.title}</div>
            <div className="activity-meta">
              <span className="activity-type">{activity.type}</span>
              <span className="activity-time">{formatDate(activity.createdAt)}</span>
            </div>
            {activity.description && (
              <div className="activity-description">{activity.description}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
