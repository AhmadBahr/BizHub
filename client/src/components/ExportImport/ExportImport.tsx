import React, { useState } from 'react';
import { 
  ArrowDownTrayIcon, 
  ArrowUpTrayIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import './ExportImport.css';

interface ExportImportProps {
  entityType: 'contacts' | 'leads' | 'deals' | 'tasks';
  onExport: (format: 'csv' | 'xlsx', filters?: any) => void;
  onImport: (file: File) => void;
  className?: string;
}

export const ExportImport: React.FC<ExportImportProps> = ({
  entityType,
  onExport,
  onImport,
  className = '',
}) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx'>('csv');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    try {
      await onExport(exportFormat);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    
    setIsProcessing(true);
    try {
      await onImport(importFile);
      setShowImportModal(false);
      setImportFile(null);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const getEntityDisplayName = () => {
    return entityType.charAt(0).toUpperCase() + entityType.slice(1);
  };

  return (
    <div className={`export-import ${className}`}>
      <div className="export-import-buttons">
        <button
          className="export-btn"
          onClick={() => setShowExportModal(true)}
          title={`Export ${getEntityDisplayName()}`}
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
        
        <button
          className="import-btn"
          onClick={() => setShowImportModal(true)}
          title={`Import ${getEntityDisplayName()}`}
        >
          <ArrowUpTrayIcon className="w-4 h-4" />
          <span>Import</span>
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <DocumentArrowDownIcon className="w-5 h-5" />
                Export {getEntityDisplayName()}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowExportModal(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="format-selection">
                <h4>Select Format</h4>
                <div className="format-options">
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                    />
                    <div className="format-info">
                      <span className="format-name">CSV</span>
                      <span className="format-desc">Comma-separated values</span>
                    </div>
                  </label>
                  
                  <label className="format-option">
                    <input
                      type="radio"
                      name="exportFormat"
                      value="xlsx"
                      checked={exportFormat === 'xlsx'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx')}
                    />
                    <div className="format-info">
                      <span className="format-name">Excel</span>
                      <span className="format-desc">Microsoft Excel format</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowExportModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleExport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <DocumentArrowUpIcon className="w-5 h-5" />
                Import {getEntityDisplayName()}
              </h3>
              <button
                className="close-btn"
                onClick={() => setShowImportModal(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="import-instructions">
                <h4>Import Instructions</h4>
                <ul>
                  <li>Supported formats: CSV, Excel (.xlsx)</li>
                  <li>Maximum file size: 10MB</li>
                  <li>First row should contain column headers</li>
                  <li>Required fields will be validated during import</li>
                </ul>
              </div>
              
              <div className="file-upload-section">
                <label className="file-upload-label">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="file-input"
                  />
                  <div className="file-upload-area">
                    {importFile ? (
                      <div className="selected-file">
                        <CheckIcon className="w-5 h-5 text-green-500" />
                        <span>{importFile.name}</span>
                        <span className="file-size">
                          ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <ArrowUpTrayIcon className="w-8 h-8 text-gray-400" />
                        <span>Click to select file or drag and drop</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowImportModal(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="confirm-btn"
                onClick={handleImport}
                disabled={!importFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Import
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
