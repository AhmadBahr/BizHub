import React, { useState, useEffect } from 'react';
import type { KnowledgeBase } from '../../types';
import './KnowledgeForm.css';

interface KnowledgeFormProps {
  knowledge?: KnowledgeBase | null;
  onSave: (knowledgeData: Partial<KnowledgeBase>) => void;
  onCancel: () => void;
}

const KnowledgeForm: React.FC<KnowledgeFormProps> = ({ knowledge, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL' as KnowledgeBase['category'],
    tags: [] as string[],
    isPublished: false
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = [
    { value: 'FAQ', label: 'FAQ' },
    { value: 'GUIDE', label: 'Guide' },
    { value: 'TROUBLESHOOTING', label: 'Troubleshooting' },
    { value: 'FEATURE', label: 'Feature' },
    { value: 'GENERAL', label: 'General' }
  ];

  const commonTags = [
    'getting-started', 'tutorial', 'login', 'billing', 'quotes', 'invoices',
    'support', 'technical', 'authentication', 'payments', 'reports'
  ];

  useEffect(() => {
    if (knowledge) {
      setFormData({
        title: knowledge.title,
        content: knowledge.content,
        category: knowledge.category,
        tags: knowledge.tags,
        isPublished: knowledge.isPublished
      });
    }
  }, [knowledge]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddCommonTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const knowledgeData: Partial<KnowledgeBase> = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim() !== '')
    };

    onSave(knowledgeData);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content knowledge-form-modal">
        <div className="modal-header">
          <h2>{knowledge ? 'Edit Article' : 'New Knowledge Base Article'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form className="knowledge-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section">
              <h3>Article Information</h3>
              
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter article title"
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categoryOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Publish immediately
                  </label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Content</h3>
              
              <div className="form-group">
                <label htmlFor="content">Article Content *</label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your article content here..."
                  rows={12}
                  className={errors.content ? 'error' : ''}
                />
                {errors.content && <span className="error-message">{errors.content}</span>}
                <div className="content-info">
                  <span className="char-count">{formData.content.length} characters</span>
                  <span className="min-chars">Minimum 50 characters</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Tags</h3>
              
              <div className="form-group">
                <label htmlFor="newTag">Add Tags</label>
                <div className="tag-input-group">
                  <input
                    type="text"
                    id="newTag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter a tag and press Enter"
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Common Tags</label>
                <div className="common-tags">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-btn ${formData.tags.includes(tag) ? 'selected' : ''}`}
                      onClick={() => handleAddCommonTag(tag)}
                      disabled={formData.tags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="form-group">
                  <label>Current Tags</label>
                  <div className="current-tags">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag-item">
                        {tag}
                        <button
                          type="button"
                          className="remove-tag"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>Preview</h3>
              
              <div className="preview-card">
                <div className="preview-header">
                  <h4>{formData.title || 'Untitled Article'}</h4>
                  <span className={`status-badge ${formData.isPublished ? 'published' : 'draft'}`}>
                    {formData.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="preview-category">
                  <span className="category-badge">
                    {categoryOptions.find(opt => opt.value === formData.category)?.label || 'General'}
                  </span>
                </div>
                {formData.tags.length > 0 && (
                  <div className="preview-tags">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="preview-content">
                  {formData.content || 'No content yet...'}
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {knowledge ? 'Update Article' : 'Create Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KnowledgeForm;
