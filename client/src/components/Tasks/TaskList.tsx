import React, { useState } from 'react';
import type { Task } from '../../types';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onPriorityChange: (taskId: string, newPriority: string) => void;
  loading?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onPriorityChange,
  loading = false
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Task>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const statuses = [
    'Not Started',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled'
  ];

  const priorities = [
    'Low',
    'Medium',
    'High',
    'Urgent'
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': '#6b7280',
      'In Progress': '#3b82f6',
      'On Hold': '#f59e0b',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Low': '#10b981',
      'Medium': '#f59e0b',
      'High': '#f97316',
      'Urgent': '#ef4444'
    };
    return colors[priority] || '#6b7280';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981';
    if (progress >= 60) return '#f59e0b';
    if (progress >= 40) return '#f97316';
    return '#ef4444';
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date < today) {
      return `${Math.ceil((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} days overdue`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const isOverdue = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj < new Date();
  };

  const handleSort = (field: keyof Task) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedTasks = [...(tasks || [])].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Handle date sorting
    if (sortField === 'dueDate' || sortField === 'createdAt' || sortField === 'updatedAt') {
      if (!aValue || !bValue) return 0;
      // Type guard to ensure we have valid date values
      if (typeof aValue === 'string' || aValue instanceof Date || typeof aValue === 'number') {
        if (typeof bValue === 'string' || bValue instanceof Date || typeof bValue === 'number') {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }
      }
      return 0;
    }
    
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = sortedTasks?.slice(indexOfFirstItem, indexOfLastItem) || [];
  const totalPages = Math.ceil((tasks?.length || 0) / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="task-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-icon">📋</div>
        <h3>No tasks found</h3>
        <p>Create your first task to get started with your project management.</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="list-header">
        <div className="list-info">
          <h3>Tasks ({tasks?.length || 0})</h3>
          <span className="list-subtitle">Manage your project tasks</span>
        </div>
        <div className="list-actions">
          <select 
            className="status-filter"
            onChange={(e) => {
              // This would filter tasks by status
              console.log('Filter by status:', e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <select 
            className="priority-filter"
            onChange={(e) => {
              // This would filter tasks by priority
              console.log('Filter by priority:', e.target.value);
            }}
          >
            <option value="">All Priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="list-table">
        <div className="table-header">
          <div className="header-cell sortable" onClick={() => handleSort('title')}>
            Task Name
            {sortField === 'title' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('category')}>
            Category
            {sortField === 'category' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('status')}>
            Status
            {sortField === 'status' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('priority')}>
            Priority
            {sortField === 'priority' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('progress')}>
            Progress
            {sortField === 'progress' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('dueDate')}>
            Due Date
            {sortField === 'dueDate' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell sortable" onClick={() => handleSort('assignedTo')}>
            Assigned To
            {sortField === 'assignedTo' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
          <div className="header-cell">Actions</div>
        </div>

        <div className="table-body">
          {currentTasks?.map((task) => (
            <div key={task.id} className="table-row">
              <div className="table-cell task-name">
                <div className="task-info">
                  <h4>{task.title}</h4>
                  <p className="task-description">{task.description || 'No description'}</p>
                  <div className="task-tags">
                    {task.tags?.slice(0, 2).map((tag, index) => (
                      <span key={index} className="task-tag">{tag}</span>
                    ))}
                    {task.tags && task.tags.length > 2 && (
                      <span className="task-tag more">+{task.tags.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="table-cell category">{task.category || 'General'}</div>
              <div className="table-cell status">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className="status-select"
                  style={{ borderColor: getStatusColor(task.status) }}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="table-cell priority">
                <select
                  value={task.priority}
                  onChange={(e) => onPriorityChange(task.id, e.target.value)}
                  className="priority-select"
                  style={{ borderColor: getPriorityColor(task.priority) }}
                >
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div className="table-cell progress">
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${task.progress || 0}%`,
                        backgroundColor: getProgressColor(task.progress || 0)
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{task.progress || 0}%</span>
                </div>
              </div>
              <div className="table-cell due-date">
                <span className={`due-date-text ${isOverdue(task.dueDate || '') ? 'overdue' : ''}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
              <div className="table-cell assigned-to">{task.assignedTo?.firstName || 'Unassigned'}</div>
              <div className="table-cell actions">
                <div className="action-buttons">
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => onView(task)}
                    title="View Task"
                  >
                    👁️
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => onEdit(task)}
                    title="Edit Task"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(task.id)}
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`btn btn-page ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
