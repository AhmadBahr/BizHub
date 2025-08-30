import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask,
  setSelectedTask,
  clearError,
  setSearchTerm,
  setStatusFilter,
  setPriorityFilter,
  updateTaskPriority
} from '../store/slices/tasksSlice';
import TaskForm from '../components/Tasks/TaskForm';
import TaskList from '../components/Tasks/TaskList';
import TaskCalendar from '../components/Tasks/TaskCalendar';
import TaskFilters from '../components/Tasks/TaskFilters';
import TaskAnalytics from '../components/Tasks/TaskAnalytics';
import './Tasks.css';

const Tasks: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    tasks, 
    selectedTask, 
    isLoading, 
    error, 
    page, 
    limit,
    searchTerm,
    statusFilter,
    priorityFilter
  } = useAppSelector((state) => state.tasks);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
  }, [dispatch, page, limit, searchTerm, statusFilter, priorityFilter]);

  const handleCreateTask = async (taskData: any) => {
    try {
      await dispatch(createTask(taskData)).unwrap();
      setShowForm(false);
      dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!selectedTask) return;
    
    try {
      await dispatch(updateTask({ id: selectedTask.id, data: taskData })).unwrap();
      setShowForm(false);
      setIsEditing(false);
      dispatch(setSelectedTask(null));
      dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap();
        dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleEditTask = (task: any) => {
    dispatch(setSelectedTask(task));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewTask = (task: any) => {
    dispatch(setSelectedTask(task));
    setIsEditing(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsEditing(false);
    dispatch(setSelectedTask(null));
  };

  const handleSearch = (term: string) => {
    dispatch(setSearchTerm(term));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setStatusFilter(status));
  };

  const handlePriorityFilter = (priority: string) => {
    dispatch(setPriorityFilter(priority));
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await dispatch(updateTask({ id: taskId, data: { status: newStatus } })).unwrap();
      dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: string) => {
    try {
      await dispatch(updateTaskPriority({ id: taskId, priority: newPriority })).unwrap();
      console.log('Task priority updated successfully');
      dispatch(fetchTasks({ page, limit, search: searchTerm, status: statusFilter, priority: priorityFilter }));
    } catch (error) {
      console.error('Failed to update task priority');
    }
  };

  if (error) {
    return (
      <div className="tasks-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-content">
          <h1 className="tasks-title">Task Management</h1>
          <p className="tasks-subtitle">Organize and track your daily tasks and activities</p>
        </div>
        <div className="header-actions">
          <div className="view-mode-toggle">
            <button 
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
            <button 
              className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar View
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Add New Task
          </button>
        </div>
      </div>

      <div className="tasks-content">
        <div className="tasks-sidebar">
          <TaskAnalytics />
        </div>
        
        <div className="tasks-main">
          <TaskFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onSearch={handleSearch}
            onStatusFilter={handleStatusFilter}
            onPriorityFilter={handlePriorityFilter}
          />
          
          {viewMode === 'list' && (
            <TaskList
              tasks={tasks}
              loading={isLoading}
              onEdit={handleEditTask}
              onView={handleViewTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleTaskStatusChange}
              onPriorityChange={handlePriorityChange}
            />
          )}
          
          {viewMode === 'calendar' && (
            <TaskCalendar
              tasks={tasks}
              loading={isLoading}
              onEdit={handleEditTask}
              onView={handleViewTask}
              onDelete={handleDeleteTask}
              onStatusChange={handleTaskStatusChange}
            />
          )}
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={selectedTask || undefined}
          isEditing={isEditing}
          onSubmit={isEditing ? handleUpdateTask : handleCreateTask}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default Tasks;
