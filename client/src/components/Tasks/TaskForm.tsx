import React, { useState, useEffect } from 'react';
import type { Task, User } from '../../types';
import './TaskForm.css';

interface TaskFormProps {
  task?: Partial<Task>;
  isEditing: boolean;
  onSubmit: (task: Partial<Task>) => void;
  onClose: () => void;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  notes: string;
  tags: string[];
  assignedToId: string;
  relatedToType: string;
  relatedToId: string;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, isEditing, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    status: 'PENDING',
    priority: 'MEDIUM',
    dueDate: '',
    notes: '',
    tags: [],
    assignedToId: '',
    relatedToType: '',
    relatedToId: '',
  });

  const [users, setUsers] = useState<User[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'PENDING',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        notes: task.notes || '',
        tags: task.tags || [],
        assignedToId: task.assignedToId || '',
        relatedToType: task.relatedToType || '',
        relatedToId: task.relatedToId || '',
      });
    }
    
    // Load users
    loadUsers();
  }, [task]);

  const loadUsers = async () => {
    try {
      // This would fetch users from the backend
      // const response = await apiService.getData<User[]>('/users');
      // setUsers(response);
      setUsers([]); // Empty for now, will be populated when API is ready
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, tags: value.split(',').map(tag => tag.trim()).filter(Boolean) }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData: Partial<Task> = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : new Date(),
        tags: formData.tags || [],
      };
      
      onSubmit(submitData);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'High': '#ef4444',
      'Medium': '#f59e0b',
      'Low': '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Not Started': '#6b7280',
      'In Progress': '#3b82f6',
      'Under Review': '#8b5cf6',
      'Completed': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h2>{isEditing ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Enter task title"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'Not Started'}
                onChange={handleInputChange}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className={errors.priority ? 'error' : ''}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.priority && <span className="error-message">{errors.priority}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedToId">Assigned To</label>
              <select
                id="assignedToId"
                name="assignedToId"
                value={formData.assignedToId || ''}
                onChange={handleInputChange}
                className={errors.assignedToId ? 'error' : ''}
              >
                <option value="">Select assignee</option>
                {users.length > 0 ? (
                  users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No users available</option>
                )}
              </select>
              {errors.assignedToId && <span className="error-message">{errors.assignedToId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="relatedToType">Related To</label>
              <select
                id="relatedToType"
                name="relatedToType"
                value={formData.relatedToType || 'Lead'}
                onChange={handleInputChange}
              >
                <option value="Lead">Lead</option>
                <option value="Deal">Deal</option>
                <option value="Contact">Contact</option>
                <option value="Company">Company</option>
                <option value="None">None</option>
              </select>
            </div>
          </div>

          {formData.relatedToType !== 'None' && (
            <div className="form-group">
              <label htmlFor="relatedToId">Related To</label>
              <select
                id="relatedToId"
                name="relatedToId"
                value={formData.relatedToId || ''}
                onChange={handleInputChange}
                disabled={!formData.relatedToType}
              >
                <option value="">Select {formData.relatedToType || 'item'}</option>
                {formData.relatedToType ? (
                  <option value="" disabled>No {formData.relatedToType} available</option>
                ) : (
                  <option value="" disabled>Select a type first</option>
                )}
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add any additional notes or instructions"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={handleTagsChange}
              placeholder="Enter tags separated by commas"
            />
            <small className="form-help">Separate tags with commas (e.g., urgent, bug, feature)</small>
          </div>

          <div className="form-preview">
            <h4>Task Preview</h4>
            <div className="preview-card">
              <div className="preview-header">
                <span 
                  className="preview-priority"
                  style={{ backgroundColor: getPriorityColor(formData.priority || 'Medium') }}
                >
                  {formData.priority}
                </span>
                <span 
                  className="preview-status"
                  style={{ backgroundColor: getStatusColor(formData.status || 'Not Started') }}
                >
                  {formData.status}
                </span>
              </div>
              <div className="preview-title">{formData.title || 'Task Title'}</div>
              <div className="preview-details">
                <span>📅 {formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : 'No due date'}</span>
                <span>🎯 {formData.priority}</span>
                <span>👤 {users.find(u => u.id === formData.assignedToId)?.firstName || 'Unassigned'}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
