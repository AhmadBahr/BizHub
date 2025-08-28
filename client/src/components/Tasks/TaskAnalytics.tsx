import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TaskAnalytics.css';

interface TaskAnalyticsProps {
  // This would typically receive analytics data from props
  // For now, we'll use mock data
}

const TaskAnalytics: React.FC<TaskAnalyticsProps> = () => {
  // Mock data - in a real app, this would come from the backend
  const analyticsData = {
    totalTasks: 234,
    completedTasks: 187,
    pendingTasks: 47,
    overdueTasks: 12,
    completionRate: 79.9,
    averageCompletionTime: 2.3,
    priorityDistribution: [
      { priority: 'High', count: 45, color: '#ef4444' },
      { priority: 'Medium', count: 128, color: '#f59e0b' },
      { priority: 'Low', count: 61, color: '#10b981' }
    ],
    statusDistribution: [
      { status: 'Not Started', count: 23, color: '#6b7280' },
      { status: 'In Progress', count: 47, color: '#3b82f6' },
      { status: 'Under Review', count: 18, color: '#8b5cf6' },
      { status: 'Completed', count: 187, color: '#10b981' },
      { status: 'Cancelled', count: 6, color: '#ef4444' }
    ],
    weeklyCompletion: [
      { week: 'Week 1', completed: 28, created: 32 },
      { week: 'Week 2', completed: 35, created: 29 },
      { week: 'Week 3', completed: 42, created: 38 },
      { week: 'Week 4', completed: 31, created: 35 },
      { week: 'Week 5', completed: 38, created: 41 },
      { week: 'Week 6', completed: 45, created: 39 }
    ],
    topPerformers: [
      { name: 'Alex Thompson', completed: 24, efficiency: 94.2, avatar: '👨‍💼' },
      { name: 'Maria Garcia', completed: 22, efficiency: 91.8, avatar: '👩‍💼' },
      { name: 'James Wilson', completed: 20, efficiency: 89.5, avatar: '👨‍💼' },
      { name: 'Lisa Chen', completed: 19, efficiency: 87.3, avatar: '👩‍💼' }
    ],
    categoryBreakdown: [
      { category: 'Sales', count: 78, percentage: 33.3 },
      { category: 'Marketing', count: 65, percentage: 27.8 },
      { category: 'Development', count: 45, percentage: 19.2 },
      { category: 'Support', count: 32, percentage: 13.7 },
      { category: 'Administration', count: 14, percentage: 6.0 }
    ]
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const formatTime = (days: number) => {
    return `${days} days`;
  };

  return (
    <div className="task-analytics">
      <div className="analytics-header">
        <h3>Task Analytics</h3>
        <p>Productivity insights and performance metrics</p>
      </div>

      <div className="analytics-metrics">
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.totalTasks}</div>
            <div className="metric-label">Total Tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.completedTasks}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.overdueTasks}</div>
            <div className="metric-label">Overdue</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{analyticsData.completionRate}%</div>
            <div className="metric-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Weekly Completion Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analyticsData.weeklyCompletion}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Completed"
            />
            <Line 
              type="monotone" 
              dataKey="created" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Created"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-section">
        <h4>Priority Distribution</h4>
        <div className="priority-distribution">
          {analyticsData.priorityDistribution.map((priority) => (
            <div key={priority.priority} className="priority-item">
              <div className="priority-info">
                <span className="priority-name">{priority.priority}</span>
                <span className="priority-count">{priority.count} tasks</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-progress"
                  style={{ 
                    width: `${(priority.count / analyticsData.totalTasks) * 100}%`,
                    backgroundColor: priority.color
                  }}
                ></div>
              </div>
              <span className="priority-percentage">
                {((priority.count / analyticsData.totalTasks) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Status Overview</h4>
        <div className="status-overview">
          {analyticsData.statusDistribution.map((status) => (
            <div key={status.status} className="status-item">
              <div className="status-color" style={{ backgroundColor: status.color }}></div>
              <div className="status-info">
                <span className="status-name">{status.status}</span>
                <span className="status-count">{status.count}</span>
              </div>
              <span className="status-percentage">
                {((status.count / analyticsData.totalTasks) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Top Performers</h4>
        <div className="performers-list">
          {analyticsData.topPerformers.map((performer, index) => (
            <div key={performer.name} className="performer-item">
              <div className="performer-rank">#{index + 1}</div>
              <div className="performer-avatar">{performer.avatar}</div>
              <div className="performer-info">
                <div className="performer-name">{performer.name}</div>
                <div className="performer-stats">
                  {performer.completed} completed • {performer.efficiency}% efficiency
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Category Breakdown</h4>
        <div className="category-chart">
          <div className="category-legend">
            {analyticsData.categoryBreakdown.map((category) => (
              <div key={category.category} className="legend-item">
                <span className="legend-color" style={{ 
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][
                    analyticsData.categoryBreakdown.findIndex(c => c.category === category.category)
                  ]
                }}></span>
                <span className="legend-label">{category.category}</span>
                <span className="legend-value">{category.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Key Metrics</h4>
        <div className="key-metrics">
          <div className="key-metric">
            <div className="key-metric-label">Average Completion Time</div>
            <div className="key-metric-value">{formatTime(analyticsData.averageCompletionTime)}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Pending Tasks</div>
            <div className="key-metric-value">{analyticsData.pendingTasks}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Overdue Rate</div>
            <div className="key-metric-value">{formatPercentage((analyticsData.overdueTasks / analyticsData.totalTasks) * 100)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;
