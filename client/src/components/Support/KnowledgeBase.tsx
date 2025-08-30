import React, { useState, useEffect } from 'react';
import type { KnowledgeBase as KnowledgeBaseType } from '../../types';
import './KnowledgeBase.css';
import AccessibleButton from '../Accessibility/AccessibleButton';

interface KnowledgeBaseProps {
  articles?: KnowledgeBaseType[];
  onViewArticle?: (article: KnowledgeBaseType) => void;
  onEditArticle?: (article: KnowledgeBaseType) => void;
  onDeleteArticle?: (articleId: string) => void;
  onCreateArticle?: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  articles = [],
  onViewArticle,
  onEditArticle,
  onDeleteArticle,
  onCreateArticle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeBaseType[]>(articles);

  const categories = [
    { value: 'ALL', label: 'All Categories', icon: '📚' },
    { value: 'FAQ', label: 'FAQ', icon: '❓' },
    { value: 'GUIDE', label: 'Guides', icon: '📖' },
    { value: 'TROUBLESHOOTING', label: 'Troubleshooting', icon: '🔧' },
    { value: 'FEATURE', label: 'Features', icon: '✨' },
    { value: 'GENERAL', label: 'General', icon: '📋' }
  ];

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const filterArticles = () => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.content.toLowerCase().includes(term) ||
        article.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredArticles(filtered);
  };

  const getCategoryIcon = (category: KnowledgeBaseType['category']) => {
    switch (category) {
      case 'FAQ':
        return '❓';
      case 'GUIDE':
        return '📖';
      case 'TROUBLESHOOTING':
        return '🔧';
      case 'FEATURE':
        return '✨';
      case 'GENERAL':
        return '📋';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="knowledge-base">
      <div className="knowledge-base-header">
        <div className="header-content">
          <h2>Knowledge Base</h2>
          <p>Find answers to common questions and helpful guides</p>
        </div>
        {onCreateArticle && (
          <AccessibleButton
            onClick={onCreateArticle}
            className="btn-create-article"
            aria-label="Create new knowledge article"
          >
            <span className="btn-icon">+</span>
            New Article
          </AccessibleButton>
        )}
      </div>

      <div className="knowledge-base-filters">
        <div className="search-container">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search knowledge base"
            />
          </div>
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`category-filter ${selectedCategory === category.value ? 'active' : ''}`}
              aria-label={`Filter by ${category.label}`}
            >
              <span className="category-icon">{category.icon}</span>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="knowledge-base-content">
        {filteredArticles.length === 0 ? (
          <div className="knowledge-base-empty">
            <div className="empty-icon">📚</div>
            <h3>No articles found</h3>
            <p>
              {searchTerm || selectedCategory !== 'ALL'
                ? 'Try adjusting your search or category filters.'
                : 'No knowledge base articles have been created yet.'
              }
            </p>
          </div>
        ) : (
          <div className="articles-grid">
            {filteredArticles.map((article) => (
              <div key={article.id} className="article-card">
                <div className="article-header">
                  <div className="article-category">
                    <span className="category-icon">{getCategoryIcon(article.category)}</span>
                    <span className="category-name">{article.category.replace('_', ' ')}</span>
                  </div>
                  <div className="article-status">
                    <span className={`status-badge ${article.isPublished ? 'published' : 'draft'}`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>

                <div className="article-content">
                  <h3 className="article-title" onClick={() => onViewArticle?.(article)}>
                    {article.title}
                  </h3>
                  <p className="article-excerpt">
                    {truncateContent(article.content)}
                  </p>
                </div>

                <div className="article-tags">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="tag-more">+{article.tags.length - 3} more</span>
                  )}
                </div>

                <div className="article-footer">
                  <div className="article-meta">
                    <span className="article-date">
                      {formatDate(article.updatedAt)}
                    </span>
                    {article.author && (
                      <span className="article-author">
                        by {article.author.firstName} {article.author.lastName}
                      </span>
                    )}
                  </div>

                  <div className="article-actions">
                    {onViewArticle && (
                      <AccessibleButton
                        onClick={() => onViewArticle(article)}
                        className="btn-view"
                        aria-label={`View article ${article.title}`}
                      >
                        View
                      </AccessibleButton>
                    )}
                    {onEditArticle && (
                      <AccessibleButton
                        onClick={() => onEditArticle(article)}
                        className="btn-edit"
                        aria-label={`Edit article ${article.title}`}
                      >
                        Edit
                      </AccessibleButton>
                    )}
                    {onDeleteArticle && (
                      <AccessibleButton
                        onClick={() => onDeleteArticle(article.id)}
                        className="btn-delete"
                        aria-label={`Delete article ${article.title}`}
                      >
                        Delete
                      </AccessibleButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
