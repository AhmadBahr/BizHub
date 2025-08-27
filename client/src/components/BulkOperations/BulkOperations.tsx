import React, { useState } from 'react';
import { 
  TrashIcon, 
  PencilIcon, 
  CheckIcon,
  XMarkIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import './BulkOperations.css';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedIds: string[]) => void;
  variant?: 'primary' | 'danger' | 'secondary';
  confirmRequired?: boolean;
  confirmMessage?: string;
}

interface BulkOperationsProps {
  selectedItems: string[];
  actions: BulkAction[];
  onSelectAll?: (selected: boolean) => void;
  onClearSelection?: () => void;
  totalItems?: number;
  className?: string;
}

export const BulkOperations: React.FC<BulkOperationsProps> = ({
  selectedItems,
  actions,
  onSelectAll,
  onClearSelection,
  totalItems = 0,
  className = '',
}) => {
  const [showActions, setShowActions] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const handleAction = (action: BulkAction) => {
    if (action.confirmRequired) {
      setConfirmAction(action);
    } else {
      action.action(selectedItems);
      setShowActions(false);
    }
  };

  const confirmActionExecution = () => {
    if (confirmAction) {
      confirmAction.action(selectedItems);
      setConfirmAction(null);
      setShowActions(false);
    }
  };

  const cancelAction = () => {
    setConfirmAction(null);
  };

  const getActionVariantClass = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'action-danger';
      case 'primary':
        return 'action-primary';
      default:
        return 'action-secondary';
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className={`bulk-operations ${className}`}>
      <div className="bulk-header">
        <div className="selection-info">
          <span className="selected-count">
            {selectedItems.length} of {totalItems} selected
          </span>
          {onClearSelection && (
            <button
              className="clear-selection-btn"
              onClick={onClearSelection}
              title="Clear selection"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="bulk-actions">
          {onSelectAll && (
            <button
              className="select-all-btn"
              onClick={() => onSelectAll(selectedItems.length < totalItems)}
            >
              {selectedItems.length === totalItems ? 'Deselect All' : 'Select All'}
            </button>
          )}

          <div className="actions-dropdown">
            <button
              className="actions-toggle-btn"
              onClick={() => setShowActions(!showActions)}
            >
              <EllipsisHorizontalIcon className="w-4 h-4" />
              Actions
            </button>

            {showActions && (
              <div className="actions-menu">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    className={`action-item ${getActionVariantClass(action.variant)}`}
                    onClick={() => handleAction(action)}
                  >
                    {action.icon}
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {actions.slice(0, 3).map((action) => (
          <button
            key={action.id}
            className={`quick-action-btn ${getActionVariantClass(action.variant)}`}
            onClick={() => handleAction(action)}
            title={action.label}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="confirmation-overlay" onClick={cancelAction}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <h3>Confirm Action</h3>
              <button className="close-btn" onClick={cancelAction}>
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="confirmation-body">
              <p>
                {confirmAction.confirmMessage || 
                  `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedItems.length} item(s)?`
                }
              </p>
              <p className="warning-text">
                This action cannot be undone.
              </p>
            </div>
            
            <div className="confirmation-footer">
              <button className="cancel-btn" onClick={cancelAction}>
                Cancel
              </button>
              <button 
                className={`confirm-btn ${getActionVariantClass(confirmAction.variant)}`}
                onClick={confirmActionExecution}
              >
                {confirmAction.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Predefined bulk actions
export const createBulkActions = {
  delete: (onDelete: (ids: string[]) => void): BulkAction => ({
    id: 'delete',
    label: 'Delete',
    icon: <TrashIcon className="w-4 h-4" />,
    action: onDelete,
    variant: 'danger',
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
  }),

  edit: (onEdit: (ids: string[]) => void): BulkAction => ({
    id: 'edit',
    label: 'Edit',
    icon: <PencilIcon className="w-4 h-4" />,
    action: onEdit,
    variant: 'primary',
  }),

  markComplete: (onMarkComplete: (ids: string[]) => void): BulkAction => ({
    id: 'mark-complete',
    label: 'Mark Complete',
    icon: <CheckIcon className="w-4 h-4" />,
    action: onMarkComplete,
    variant: 'primary',
  }),

  archive: (onArchive: (ids: string[]) => void): BulkAction => ({
    id: 'archive',
    label: 'Archive',
    icon: <TrashIcon className="w-4 h-4" />,
    action: onArchive,
    variant: 'secondary',
    confirmRequired: true,
    confirmMessage: 'Are you sure you want to archive the selected items?',
  }),
};
