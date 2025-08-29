import React, { useState, useEffect } from 'react';
import './QuoteTemplateForm.css';

interface QuoteTemplate {
  id?: string;
  name: string;
  description?: string;
  content: string;
  variables?: Record<string, any>;
  isActive?: boolean;
}

interface QuoteTemplateFormProps {
  template?: QuoteTemplate;
  onSave: (template: QuoteTemplate) => void;
  onCancel: () => void;
  loading?: boolean;
}

const QuoteTemplateForm: React.FC<QuoteTemplateFormProps> = ({
  template,
  onSave,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<QuoteTemplate>({
    name: '',
    description: '',
    content: '',
    variables: {},
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      setFormData({
        id: template.id,
        name: template.name,
        description: template.description || '',
        content: template.content,
        variables: template.variables || {},
        isActive: template.isActive !== false,
      });
    }
  }, [template]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Template content is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      const newContent = before + `{{${variable}}}` + after;
      handleInputChange('content', newContent);
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const commonVariables = [
    'company_name',
    'contact_name',
    'contact_email',
    'contact_phone',
    'quote_number',
    'quote_date',
    'valid_until',
    'subtotal',
    'tax_amount',
    'total_amount',
    'line_items',
    'terms_conditions',
  ];

  return (
    <div className="quote-template-form-overlay">
      <div className="quote-template-form-modal">
        <div className="form-header">
          <h2>{template ? 'Edit Template' : 'Create Template'}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="quote-template-form">
          <div className="form-grid">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="template-name">Template Name *</label>
                <input
                  type="text"
                  id="template-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter template name"
                  disabled={loading}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="template-description">Description</label>
                <textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter template description"
                  rows={3}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    disabled={loading}
                  />
                  <span className="checkmark"></span>
                  Active Template
                </label>
              </div>
            </div>

            <div className="form-section">
              <div className="form-group">
                <label htmlFor="template-content">Template Content *</label>
                <div className="content-editor">
                  <div className="variables-panel">
                    <h4>Available Variables</h4>
                    <div className="variables-list">
                      {commonVariables.map((variable) => (
                        <button
                          key={variable}
                          type="button"
                          className="variable-btn"
                          onClick={() => insertVariable(variable)}
                          disabled={loading}
                        >
                          {variable}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    id="template-content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className={errors.content ? 'error' : ''}
                    placeholder="Enter your template content. Use {{variable_name}} to insert dynamic content."
                    rows={15}
                    disabled={loading}
                  />
                </div>
                {errors.content && <span className="error-message">{errors.content}</span>}
                <div className="content-help">
                  <p><strong>Template Variables:</strong></p>
                  <ul>
                    <li><code>{'{{company_name}}'}</code> - Your company name</li>
                    <li><code>{'{{contact_name}}'}</code> - Contact's full name</li>
                    <li><code>{'{{quote_number}}'}</code> - Generated quote number</li>
                    <li><code>{'{{total_amount}}'}</code> - Calculated total amount</li>
                    <li><code>{'{{line_items}}'}</code> - Formatted line items table</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {template ? 'Update Template' : 'Create Template'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuoteTemplateForm;
