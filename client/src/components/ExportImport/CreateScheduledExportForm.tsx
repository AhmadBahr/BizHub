import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  EnvelopeIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useAccessibility } from '../../hooks/useAccessibility';
import AccessibleButton from '../Accessibility/AccessibleButton';
import './ScheduledExports.css';

interface ScheduledExport {
  id?: string;
  name: string;
  description?: string;
  entityType: 'contacts' | 'leads' | 'deals' | 'tasks' | 'analytics';
  format: 'csv' | 'excel' | 'pdf';
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  scheduleConfig: {
    dayOfWeek?: number;
    dayOfMonth?: number;
    hour?: number;
    minute?: number;
    timezone?: string;
    customCron?: string;
  };
  filters?: Record<string, any>;
  recipients: string[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateScheduledExportFormProps {
  scheduledExport?: ScheduledExport;
  onSave: (exportData: ScheduledExport) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const CreateScheduledExportForm: React.FC<CreateScheduledExportFormProps> = ({
  scheduledExport,
  onSave,
  onCancel,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ScheduledExport>({
    name: '',
    description: '',
    entityType: 'contacts',
    format: 'csv',
    schedule: 'daily',
    scheduleConfig: {
      hour: 9,
      minute: 0,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    filters: {},
    recipients: [''],
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    if (scheduledExport) {
      setFormData(scheduledExport);
    }
  }, [scheduledExport]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.recipients.length === 0 || !formData.recipients[0].trim()) {
      newErrors.recipients = 'At least one recipient is required';
    }

    // Validate email format for recipients
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    formData.recipients.forEach((recipient, index) => {
      if (recipient.trim() && !emailRegex.test(recipient.trim())) {
        newErrors[`recipient-${index}`] = 'Invalid email format';
      }
    });

    // Validate schedule configuration
    if (formData.schedule === 'weekly' && formData.scheduleConfig.dayOfWeek === undefined) {
      newErrors.scheduleConfig = 'Day of week is required for weekly schedule';
    }

    if (formData.schedule === 'monthly' && formData.scheduleConfig.dayOfMonth === undefined) {
      newErrors.scheduleConfig = 'Day of month is required for monthly schedule';
    }

    if (formData.schedule === 'custom' && !formData.scheduleConfig.customCron?.trim()) {
      newErrors.scheduleConfig = 'Custom cron expression is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      announceToScreenReader('Please fix form errors before submitting', 'assertive');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Clean up recipients array (remove empty entries)
      const cleanRecipients = formData.recipients.filter(r => r.trim());
      
      const exportData = {
        ...formData,
        recipients: cleanRecipients,
      };

      await onSave(exportData);
      announceToScreenReader(
        `Scheduled export ${isEditing ? 'updated' : 'created'} successfully`
      );
    } catch (error) {
      console.error('Failed to save scheduled export:', error);
      announceToScreenReader('Failed to save scheduled export', 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScheduleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      scheduleConfig: {
        ...prev.scheduleConfig,
        [field]: value,
      },
    }));
    
    if (errors.scheduleConfig) {
      setErrors(prev => ({ ...prev, scheduleConfig: '' }));
    }
  };

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, ''],
    }));
  };

  const removeRecipient = (index: number) => {
    if (formData.recipients.length > 1) {
      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients.filter((_, i) => i !== index),
      }));
    }
  };

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((r, i) => i === index ? value : r),
    }));
    
    if (errors[`recipient-${index}`]) {
      setErrors(prev => ({ ...prev, [`recipient-${index}`]: '' }));
    }
  };

  const getScheduleFields = () => {
    switch (formData.schedule) {
      case 'weekly':
        return (
          <div className="form-group">
            <label htmlFor="dayOfWeek">Day of Week</label>
            <select
              id="dayOfWeek"
              value={formData.scheduleConfig.dayOfWeek || ''}
              onChange={(e) => handleScheduleConfigChange('dayOfWeek', parseInt(e.target.value))}
              className={errors.scheduleConfig ? 'error' : ''}
            >
              <option value="">Select day</option>
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
        );
      
      case 'monthly':
        return (
          <div className="form-group">
            <label htmlFor="dayOfMonth">Day of Month</label>
            <select
              id="dayOfMonth"
              value={formData.scheduleConfig.dayOfMonth || ''}
              onChange={(e) => handleScheduleConfigChange('dayOfMonth', parseInt(e.target.value))}
              className={errors.scheduleConfig ? 'error' : ''}
            >
              <option value="">Select day</option>
              {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
        );
      
      case 'custom':
        return (
          <div className="form-group">
            <label htmlFor="customCron">Cron Expression</label>
            <input
              type="text"
              id="customCron"
              value={formData.scheduleConfig.customCron || ''}
              onChange={(e) => handleScheduleConfigChange('customCron', e.target.value)}
              placeholder="0 9 * * 1-5"
              className={errors.scheduleConfig ? 'error' : ''}
            />
            <small className="form-help">
              Format: minute hour day month day-of-week (e.g., "0 9 * * 1-5" for weekdays at 9 AM)
            </small>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content scheduled-export-form">
        <div className="modal-header">
          <h3 className="modal-title">
            {isEditing ? 'Edit' : 'Create'} Scheduled Export
          </h3>
          <AccessibleButton
            onClick={onCancel}
            variant="ghost"
            size="sm"
            ariaLabel="Close form"
            icon={<XMarkIcon className="w-5 h-5" />}
          />
        </div>

        <form onSubmit={handleSubmit} className="export-form">
          <div className="form-section">
            <h4 className="section-title">Basic Information</h4>
            
            <div className="form-group">
              <label htmlFor="name">Export Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Monthly Sales Report"
                className={errors.name ? 'error' : ''}
                required
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this export"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="entityType">Data Type</label>
                <select
                  id="entityType"
                  value={formData.entityType}
                  onChange={(e) => handleInputChange('entityType', e.target.value)}
                >
                  <option value="contacts">Contacts</option>
                  <option value="leads">Leads</option>
                  <option value="deals">Deals</option>
                  <option value="tasks">Tasks</option>
                  <option value="analytics">Analytics</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="format">Export Format</label>
                <select
                  id="format"
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">
              <ClockIcon className="w-4 h-4 mr-2" />
              Schedule Configuration
            </h4>
            
            <div className="form-group">
              <label htmlFor="schedule">Frequency</label>
              <select
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom (Cron)</option>
              </select>
            </div>

            {getScheduleFields()}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hour">Hour (24h)</label>
                <select
                  id="hour"
                  value={formData.scheduleConfig.hour || 9}
                  onChange={(e) => handleScheduleConfigChange('hour', parseInt(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="minute">Minute</label>
                <select
                  id="minute"
                  value={formData.scheduleConfig.minute || 0}
                  onChange={(e) => handleScheduleConfigChange('minute', parseInt(e.target.value))}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map(minute => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={formData.scheduleConfig.timezone || ''}
                  onChange={(e) => handleScheduleConfigChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4 className="section-title">
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Recipients
            </h4>
            
            {formData.recipients.map((recipient, index) => (
              <div key={index} className="form-group recipient-group">
                <label htmlFor={`recipient-${index}`}>
                  Recipient {index + 1} {index === 0 ? '*' : ''}
                </label>
                <div className="recipient-input-group">
                  <input
                    type="email"
                    id={`recipient-${index}`}
                    value={recipient}
                    onChange={(e) => updateRecipient(index, e.target.value)}
                    placeholder="email@example.com"
                    className={errors[`recipient-${index}`] ? 'error' : ''}
                    required={index === 0}
                  />
                  {formData.recipients.length > 1 && (
                    <AccessibleButton
                      onClick={() => removeRecipient(index)}
                      variant="ghost"
                      size="sm"
                      ariaLabel={`Remove recipient ${index + 1}`}
                      className="remove-recipient-btn"
                    >
                      ×
                    </AccessibleButton>
                  )}
                </div>
                {errors[`recipient-${index}`] && (
                  <span className="error-message">{errors[`recipient-${index}`]}</span>
                )}
              </div>
            ))}

            <AccessibleButton
              onClick={addRecipient}
              variant="outline"
              size="sm"
              ariaLabel="Add another recipient"
              className="add-recipient-btn"
            >
              + Add Recipient
            </AccessibleButton>
          </div>

          <div className="form-section">
            <h4 className="section-title">
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters (Optional)
            </h4>
            
            <div className="form-group">
              <label htmlFor="filters">Filter Configuration</label>
              <textarea
                id="filters"
                value={JSON.stringify(formData.filters, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    handleInputChange('filters', parsed);
                  } catch {
                    // Allow invalid JSON while typing
                  }
                }}
                placeholder='{"status": "active", "createdAfter": "2024-01-01"}'
                rows={4}
              />
              <small className="form-help">
                JSON format for filtering data. Leave empty for no filters.
              </small>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
                <span className="checkmark"></span>
                Activate export immediately after creation
              </label>
            </div>
          </div>

          {errors.scheduleConfig && (
            <div className="error-message global-error">{errors.scheduleConfig}</div>
          )}

          <div className="form-actions">
            <AccessibleButton
              onClick={onCancel}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </AccessibleButton>
            <AccessibleButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Export' : 'Create Export')}
            </AccessibleButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateScheduledExportForm;
