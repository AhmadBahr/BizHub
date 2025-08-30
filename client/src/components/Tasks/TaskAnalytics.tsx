import React, { useState, useEffect } from 'react';
import { apiService } from '../../services';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TaskAnalytics.css';

const TaskAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.get('/analytics/tasks');
      if (response.success) {
        setAnalyticsData(response.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
      console.error('Error loading task analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Default data structure while loading
  const defaultData = {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    priorityDistribution: [],
    statusDistribution: [],
    weeklyCompletion: [],
    topPerformers: [],
    categoryBreakdown: []
  };

    const data = analyticsData || defaultData;

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  const formatTime = (days: number) => {
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="task-analytics">
        <div className="analytics-header">
          <h3>Task Analytics</h3>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-analytics">
        <div className="analytics-header">
          <h3>Task Analytics</h3>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

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
            <div className="metric-value">{data.totalTasks}</div>
            <div className="metric-label">Total Tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{data.completedTasks}</div>
            <div className="metric-label">Completed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-value">{data.overdueTasks}</div>
            <div className="metric-label">Overdue</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <div className="metric-value">{data.completionRate}%</div>
            <div className="metric-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h4>Weekly Completion Trend</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.weeklyCompletion}>
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
          {data.priorityDistribution.map((priority) => (
            <div key={priority.priority} className="priority-item">
              <div className="priority-info">
                <span className="priority-name">{priority.priority}</span>
                <span className="priority-count">{priority.count} tasks</span>
              </div>
              <div className="priority-bar">
                <div 
                  className="priority-progress"
                  style={{ 
                    width: `${(priority.count / data.totalTasks) * 100}%`,
                    backgroundColor: priority.color
                  }}
                ></div>
              </div>
              <span className="priority-percentage">
                {((priority.count / data.totalTasks) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Status Overview</h4>
        <div className="status-overview">
          {data.statusDistribution.map((status) => (
            <div key={status.status} className="status-item">
              <div className="status-color" style={{ backgroundColor: status.color }}></div>
              <div className="status-info">
                <span className="status-name">{status.status}</span>
                <span className="status-count">{status.count}</span>
              </div>
              <span className="status-percentage">
                {((status.count / data.totalTasks) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="analytics-section">
        <h4>Top Performers</h4>
        <div className="performers-list">
          {data.topPerformers.map((performer, index) => (
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
            {data.categoryBreakdown.map((category) => (
              <div key={category.category} className="legend-item">
                <span className="legend-color" style={{ 
                  backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'][
                    data.categoryBreakdown.findIndex(c => c.category === category.category)
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
            <div className="key-metric-value">{formatTime(data.averageCompletionTime)}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Pending Tasks</div>
            <div className="key-metric-value">{data.pendingTasks}</div>
          </div>
          <div className="key-metric">
            <div className="key-metric-label">Overdue Rate</div>
            <div className="key-metric-value">{formatPercentage((data.overdueTasks / data.totalTasks) * 100)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;
