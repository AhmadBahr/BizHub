import React, { useState, useMemo } from 'react';
import type { Task } from '../../types';
import './TaskCalendar.css';

interface TaskCalendarProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  loading?: boolean;
}

const TaskCalendar: React.FC<TaskCalendarProps> = ({
  tasks,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  loading = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const statuses = [
    'Not Started',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled'
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

  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMonthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return {
      days,
      monthName: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
  }, [currentDate]);

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  if (loading) {
    return (
      <div className="task-calendar-loading">
        <div className="loading-spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className="task-calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button 
            className="btn btn-outline"
            onClick={() => navigateMonth('prev')}
          >
            ←
          </button>
          <h2 className="calendar-title">{getMonthData.monthName}</h2>
          <button 
            className="btn btn-outline"
            onClick={() => navigateMonth('next')}
          >
            →
          </button>
        </div>
        <button 
          className="btn btn-primary"
          onClick={goToToday}
        >
          Today
        </button>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">
          {getMonthData.days.map((date, index) => {
            const dayTasks = getTasksForDate(date);
            const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${isToday(date) ? 'today' : ''} ${!isCurrentMonth(date) ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedDate(date)}
              >
                <div className="day-header">
                  <span className="day-number">{date.getDate()}</span>
                  {dayTasks.length > 0 && (
                    <span className="task-count">{dayTasks.length}</span>
                  )}
                </div>
                
                <div className="day-tasks">
                  {dayTasks.slice(0, 3).map(task => (
                    <div 
                      key={task.id} 
                      className="calendar-task"
                      style={{ borderLeftColor: getStatusColor(task.status) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(task);
                      }}
                    >
                      <div className="task-priority" style={{ backgroundColor: getPriorityColor(task.priority) }}></div>
                      <div className="task-content">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          <span className="task-status">{task.status}</span>
                          {isOverdue(task.dueDate?.toISOString() || '') && (
                            <span className="task-overdue">Overdue</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="more-tasks">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="selected-date-panel">
          <div className="panel-header">
            <h3>{formatDate(selectedDate)}</h3>
            <button 
              className="close-btn"
              onClick={() => setSelectedDate(null)}
            >
              ×
            </button>
          </div>
          
          <div className="panel-content">
            {getTasksForDate(selectedDate).length === 0 ? (
              <p className="no-tasks">No tasks scheduled for this date.</p>
            ) : (
              <div className="date-tasks">
                {getTasksForDate(selectedDate).map(task => (
                  <div key={task.id} className="panel-task">
                    <div className="task-header">
                      <h4>{task.title}</h4>
                      <div className="task-actions">
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
                    
                    <div className="task-details">
                      <div className="task-status">
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
                      
                      <div className="task-info">
                        <span className="task-category">{task.category || 'General'}</span>
                        <span className="task-assignee">�� {task.assignedTo?.firstName || 'Unassigned'}</span>
                        <span className="task-progress">{task.progress || 0}%</span>
                      </div>
                      
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="task-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;
