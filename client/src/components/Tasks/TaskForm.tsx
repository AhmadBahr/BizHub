import React, { useState, useEffect } from 'react';
import type { Task } from '../../types';
import './TaskForm.css';

interface TaskFormProps {
  task?: Task | null;
  isEditing: boolean;
  onSubmit: (data: Partial<Task>) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, isEditing, onSubmit, onClose }) => {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: new Date(),
    estimatedHours: 1,
    tags: [],
    notes: '',
    assignedToId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Not Started',
        priority: task.priority || 'Medium',
        category: task.category || 'General',
        dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
        estimatedHours: task.estimatedHours || 1,
        notes: task.notes || '',
        tags: task.tags || [],
        assignedToId: task.assignedToId || '',
        relatedToId: task.relatedToId || '',
        relatedToType: task.relatedToType || 'Lead'
      });
    }
  }, [task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
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

    if ((formData.estimatedHours || 0) < 0.1) {
      newErrors.estimatedHours = 'Estimated hours must be at least 0.1';
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
      const submitData = {
        ...formData,
        tags: formData.tags || [],
        estimatedHours: parseFloat(formData.estimatedHours?.toString() || '1')
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
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category || 'General'}
                onChange={handleInputChange}
              >
                <option value="General">General</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Development">Development</option>
                <option value="Support">Support</option>
                <option value="Administration">Administration</option>
                <option value="Research">Research</option>
                <option value="Planning">Planning</option>
              </select>
            </div>
          </div>

          <div className="form-row">
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

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority || 'Medium'}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className={errors.dueDate ? 'error' : ''}
              />
              {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="estimatedHours">Estimated Hours</label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours || ''}
                onChange={handleInputChange}
                className={errors.estimatedHours ? 'error' : ''}
                placeholder="1.0"
                min="0.1"
                step="0.1"
              />
              {errors.estimatedHours && <span className="error-message">{errors.estimatedHours}</span>}
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
              >
                <option value="">Unassigned</option>
                {/* This would be populated with actual users from the backend */}
                <option value="1">Alex Thompson</option>
                <option value="2">Maria Garcia</option>
                <option value="3">James Wilson</option>
                <option value="4">Lisa Chen</option>
              </select>
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
              <label htmlFor="relatedToId">{formData.relatedToType} Selection</label>
              <select
                id="relatedToId"
                name="relatedToId"
                value={formData.relatedToId || ''}
                onChange={handleInputChange}
              >
                <option value="">Select a {formData.relatedToType?.toLowerCase()}</option>
                {/* This would be populated with actual data from the backend */}
                <option value="1">Sample {formData.relatedToType} 1</option>
                <option value="2">Sample {formData.relatedToType} 2</option>
                <option value="3">Sample {formData.relatedToType} 3</option>
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
                <span>⏱️ {formData.estimatedHours || 1}h</span>
                <span>📁 {formData.category || 'General'}</span>
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
