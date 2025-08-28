import React, { useState, useRef, useCallback } from 'react';
import { CloudArrowUpIcon, XMarkIcon, DocumentIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import './FileUpload.css';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  entityType?: string;
  entityId?: string;
  className?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  multiple = true,
  accept = '*/*',
  maxSize = 10, // 10MB default
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    return null;
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-6 h-6 text-blue-500" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
      default:
        return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newUploadedFiles: UploadedFile[] = [];

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newUploadedFiles.push({
          id: Date.now().toString() + Math.random(),
          file,
          progress: 0,
          status: 'error',
          error,
        });
      } else {
        validFiles.push(file);
        newUploadedFiles.push({
          id: Date.now().toString() + Math.random(),
          file,
          progress: 0,
          status: 'uploading',
        });
      }
    });

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [maxSize, onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  return (
    <div className={`file-upload ${className}`}>
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden-input"
        />
        
        <div className="upload-content">
          <CloudArrowUpIcon className="upload-icon" />
          <div className="upload-text">
            <p className="upload-title">
              {isDragOver ? 'Drop files here' : 'Drag and drop files here'}
            </p>
            <p className="upload-subtitle">
              or <span className="browse-link">browse files</span>
            </p>
            <p className="upload-info">
              Maximum file size: {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4 className="files-title">Uploaded Files</h4>
          <div className="files-list">
            {uploadedFiles.map((uploadedFile) => (
              <div key={uploadedFile.id} className="file-item">
                <div className="file-info">
                  {getFileIcon(uploadedFile.file)}
                  <div className="file-details">
                    <p className="file-name">{uploadedFile.file.name}</p>
                    <p className="file-size">{formatFileSize(uploadedFile.file.size)}</p>
                  </div>
                </div>
                
                <div className="file-status">
                  {uploadedFile.status === 'uploading' && (
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadedFile.progress}%` }}
                      />
                    </div>
                  )}
                  
                  {uploadedFile.status === 'success' && (
                    <span className="status-success">✓ Uploaded</span>
                  )}
                  
                  {uploadedFile.status === 'error' && (
                    <span className="status-error" title={uploadedFile.error}>
                      ✗ Error
                    </span>
                  )}
                  
                  <button
                    className="remove-file-btn"
                    onClick={() => removeFile(uploadedFile.id)}
                    title="Remove file"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
