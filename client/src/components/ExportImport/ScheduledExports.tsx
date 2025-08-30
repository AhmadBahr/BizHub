import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  ClockIcon, 
  DocumentArrowDownIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useAccessibility } from '../../hooks/useAccessibility';
import AccessibleButton from '../Accessibility/AccessibleButton';
import CreateScheduledExportForm, { type ScheduledExport } from './CreateScheduledExportForm';
import './ScheduledExports.css';

interface ScheduledExportsProps {
  // Props removed as they're not used
}

const ScheduledExports: React.FC<ScheduledExportsProps> = () => {
  const [scheduledExports, setScheduledExports] = useState<ScheduledExport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingExport, setEditingExport] = useState<ScheduledExport | undefined>(undefined);
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    fetchScheduledExports();
  }, []);

  const fetchScheduledExports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/scheduled-exports');
      if (response.ok) {
        const data = await response.json();
        setScheduledExports(data);
        announceToScreenReader(`Loaded ${data.length} scheduled exports`);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled exports:', error);
      announceToScreenReader('Failed to load scheduled exports', 'assertive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-exports/${id}/toggle`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedExport = await response.json();
        setScheduledExports(prev => 
          prev.map(exp => exp.id === id ? updatedExport : exp)
        );
        announceToScreenReader(
          `Scheduled export ${updatedExport.name} ${updatedExport.isActive ? 'activated' : 'deactivated'}`
        );
      }
    } catch (error) {
      console.error('Failed to toggle scheduled export:', error);
      announceToScreenReader('Failed to update scheduled export', 'assertive');
    }
  };

  const handleRunNow = async (id: string) => {
    try {
      const response = await fetch(`/api/scheduled-exports/${id}/run`, {
        method: 'POST',
      });

      if (response.ok) {
        announceToScreenReader('Scheduled export started successfully');
      }
    } catch (error) {
      console.error('Failed to run scheduled export:', error);
      announceToScreenReader('Failed to run scheduled export', 'assertive');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled export?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scheduled-exports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setScheduledExports(prev => prev.filter(exp => exp.id !== id));
        announceToScreenReader('Scheduled export deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete scheduled export:', error);
      announceToScreenReader('Failed to delete scheduled export', 'assertive');
    }
  };

  const handleSaveExport = (exportData: ScheduledExport) => {
    const saveExport = async () => {
      try {
        const url = exportData.id 
          ? `/api/scheduled-exports/${exportData.id}`
          : '/api/scheduled-exports';
        
        const method = exportData.id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exportData),
        });

        if (response.ok) {
          const savedExport = (await response.json()) as ScheduledExport;
          
          if (exportData.id) {
            setScheduledExports(prev => 
              prev.map(exp => exp.id === savedExport.id ? savedExport : exp)
            );
          } else {
            setScheduledExports(prev => [...prev, savedExport]);
          }
          
          setShowCreateForm(false);
          setEditingExport(undefined);
          announceToScreenReader(
            `Scheduled export ${exportData.id ? 'updated' : 'created'} successfully`
          );
        }
      } catch (error) {
        console.error('Failed to save scheduled export:', error);
        throw error;
      }
    };
    
    saveExport();
  };

  const handleEditExport = (scheduledExport: ScheduledExport) => {
    setEditingExport(scheduledExport);
    setShowCreateForm(true);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingExport(undefined);
  };

  const formatSchedule = (schedule: string, config: any) => {
    switch (schedule) {
      case 'daily':
        return `Daily at ${config.hour || 9}:${String(config.minute || 0).padStart(2, '0')}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[config.dayOfWeek || 1]} at ${config.hour || 9}:${String(config.minute || 0).padStart(2, '0')}`;
      case 'monthly':
        return `Monthly on day ${config.dayOfMonth || 1} at ${config.hour || 9}:${String(config.minute || 0).padStart(2, '0')}`;
      case 'custom':
        return `Custom: ${config.customCron || 'Not configured'}`;
      default:
        return schedule;
    }
  };

  const formatNextRun = (nextRun?: Date) => {
    if (!nextRun) return 'Not scheduled';
    
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `In ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return 'Soon';
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'contacts':
        return '👥';
      case 'leads':
        return '🎯';
      case 'deals':
        return '💰';
      case 'tasks':
        return '📋';
      case 'analytics':
        return '📊';
      default:
        return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="scheduled-exports-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading scheduled exports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="scheduled-exports-container">
      <div className="scheduled-exports-header">
        <h2 className="scheduled-exports-title">
          <ClockIcon className="w-6 h-6 mr-2" />
          Scheduled Exports
        </h2>
        <AccessibleButton
          onClick={() => setShowCreateForm(true)}
          ariaLabel="Create new scheduled export"
          icon={<PlusIcon className="w-4 h-4" />}
        >
          New Export
        </AccessibleButton>
      </div>

      {scheduledExports.length === 0 ? (
        <div className="empty-state">
          <DocumentArrowDownIcon className="w-12 h-12 text-gray-400" />
          <h3>No scheduled exports</h3>
          <p>Create your first scheduled export to automatically generate and email reports.</p>
          <AccessibleButton
            onClick={() => setShowCreateForm(true)}
            variant="primary"
            ariaLabel="Create first scheduled export"
          >
            Create Export
          </AccessibleButton>
        </div>
      ) : (
        <div className="scheduled-exports-list">
          {scheduledExports.map((scheduledExport) => (
            <div
              key={scheduledExport.id}
              className={`scheduled-export-card ${scheduledExport.isActive ? 'active' : 'inactive'}`}
            >
              <div className="export-card-header">
                <div className="export-info">
                  <div className="export-icon">
                    {getEntityIcon(scheduledExport.entityType)}
                  </div>
                  <div className="export-details">
                    <h3 className="export-name">{scheduledExport.name}</h3>
                    <p className="export-description">
                      {scheduledExport.description || `${scheduledExport.entityType} export`}
                    </p>
                    <div className="export-meta">
                      <span className="export-format">{scheduledExport.format.toUpperCase()}</span>
                      <span className="export-schedule">
                        {formatSchedule(scheduledExport.schedule, scheduledExport.scheduleConfig)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="export-status">
                  <span className={`status-badge ${scheduledExport.isActive ? 'active' : 'inactive'}`}>
                    {scheduledExport.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="export-card-body">
                <div className="export-schedule-info">
                  <div className="schedule-item">
                    <span className="schedule-label">Next Run:</span>
                    <span className="schedule-value">{formatNextRun(scheduledExport.nextRun)}</span>
                  </div>
                  {scheduledExport.lastRun && (
                    <div className="schedule-item">
                      <span className="schedule-label">Last Run:</span>
                      <span className="schedule-value">
                        {new Date(scheduledExport.lastRun).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="schedule-item">
                    <span className="schedule-label">Recipients:</span>
                    <span className="schedule-value">{scheduledExport.recipients.length} email(s)</span>
                  </div>
                </div>

                <div className="export-actions">
                  <AccessibleButton
                    onClick={() => scheduledExport.id && handleRunNow(scheduledExport.id)}
                    variant="outline"
                    size="sm"
                    ariaLabel={`Run ${scheduledExport.name} now`}
                    icon={<PlayIcon className="w-4 h-4" />}
                  >
                    Run Now
                  </AccessibleButton>
                  <AccessibleButton
                    onClick={() => scheduledExport.id && handleToggleActive(scheduledExport.id)}
                    variant="outline"
                    size="sm"
                    ariaLabel={`${scheduledExport.isActive ? 'Deactivate' : 'Activate'} ${scheduledExport.name}`}
                    icon={scheduledExport.isActive ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                  >
                    {scheduledExport.isActive ? 'Pause' : 'Activate'}
                  </AccessibleButton>

                  <AccessibleButton
                    onClick={() => handleEditExport(scheduledExport)}
                    variant="outline"
                    size="sm"
                    ariaLabel={`Edit ${scheduledExport.name}`}
                  >
                    Edit
                  </AccessibleButton>

                  <AccessibleButton
                    onClick={() => scheduledExport.id && handleDelete(scheduledExport.id)}
                    variant="danger"
                    size="sm"
                    ariaLabel={`Delete ${scheduledExport.name}`}
                    icon={<TrashIcon className="w-4 h-4" />}
                  >
                    Delete
                  </AccessibleButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <CreateScheduledExportForm
          scheduledExport={editingExport}
          onSave={handleSaveExport}
          onCancel={handleCancelForm}
          isEditing={!!editingExport}
        />
      )}
    </div>
  );
};

export default ScheduledExports;
