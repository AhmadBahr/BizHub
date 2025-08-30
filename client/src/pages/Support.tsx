import React, { useState, useEffect } from 'react';
import { supportTicketsApi, knowledgeBaseApi, contactsApi } from '../services';
import type { SupportTicket, KnowledgeBase, Contact } from '../types';
import TicketForm from '../components/Support/TicketForm';
import KnowledgeForm from '../components/Support/KnowledgeForm';
import './Support.css';

// Real data state
const [tickets, setTickets] = useState<SupportTicket[]>([]);
const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([]);
const [contacts, setContacts] = useState<Contact[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Add useEffect and data loading
useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // Load tickets, knowledge base, and contacts in parallel
    const [ticketsResponse, knowledgeResponse, contactsResponse] = await Promise.all([
      supportTicketsApi.getTickets(),
      knowledgeBaseApi.getArticles(),
      contactsApi.getContacts()
    ]);

    if (ticketsResponse.success) setTickets(ticketsResponse.data);
    if (knowledgeResponse.success) setKnowledgeBase(knowledgeResponse.data);
    if (contactsResponse.success) setContacts(contactsResponse.data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to load data');
    console.error('Error loading data:', err);
  } finally {
    setLoading(false);
  }
};

// Analytics state
const [analytics, setAnalytics] = useState<any>(null);

const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'analytics'>('tickets');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showKnowledgeForm, setShowKnowledgeForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const [dateRange, setDateRange] = useState('30');

  // Use the state variables directly

  const handleCreateTicket = () => {
    setEditingTicket(null);
    setShowTicketForm(true);
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setEditingTicket(ticket);
    setShowTicketForm(true);
  };

  const handleSaveTicket = (ticketData: Partial<SupportTicket>) => {
    console.log('Saving ticket:', ticketData);
    setShowTicketForm(false);
    setEditingTicket(null);
  };

  const handleDeleteTicket = (ticketId: string) => {
    console.log('Deleting ticket:', ticketId);
  };

  const handleCreateKnowledge = () => {
    setEditingKnowledge(null);
    setShowKnowledgeForm(true);
  };

  const handleEditKnowledge = (knowledge: KnowledgeBase) => {
    setEditingKnowledge(knowledge);
    setShowKnowledgeForm(true);
  };

  const handleSaveKnowledge = (knowledgeData: Partial<KnowledgeBase>) => {
    console.log('Saving knowledge base article:', knowledgeData);
    setShowKnowledgeForm(false);
    setEditingKnowledge(null);
  };

  const handleDeleteKnowledge = (knowledgeId: string) => {
    console.log('Deleting knowledge base article:', knowledgeId);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
  };

  return (
    <div className="support-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Customer Service & Support</h1>
          <p>Manage support tickets and knowledge base</p>
        </div>
        <div className="header-actions">
          {activeTab === 'tickets' && (
            <button className="btn btn-primary" onClick={handleCreateTicket}>
              <i className="fas fa-plus"></i>
              New Ticket
            </button>
          )}
          {activeTab === 'knowledge' && (
            <button className="btn btn-primary" onClick={handleCreateKnowledge}>
              <i className="fas fa-plus"></i>
              New Article
            </button>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          <i className="fas fa-ticket-alt"></i>
          Support Tickets
        </button>
        <button
          className={`tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <i className="fas fa-book"></i>
          Knowledge Base
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <i className="fas fa-chart-bar"></i>
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'tickets' && (
          <div className="tickets-tab">
            <div className="tickets-header">
              <div className="tickets-stats">
                <div className="stat-item">
                  <span className="stat-value">{tickets.length}</span>
                  <span className="stat-label">Total Tickets</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{tickets.filter(t => t.status === 'OPEN').length}</span>
                  <span className="stat-label">Open</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{tickets.filter(t => t.status === 'IN_PROGRESS').length}</span>
                  <span className="stat-label">In Progress</span>
                </div>
              </div>
            </div>
            
            <div className="tickets-list">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Title</th>
                    <th>Contact</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Assigned To</th>
                    <th>Created</th>
                    <th>Replies</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="ticket-number">{ticket.ticketNumber}</td>
                      <td className="ticket-title">{ticket.title}</td>
                      <td className="contact-info">
                        {ticket.contact ? (
                          <>
                            <div>{ticket.contact.firstName} {ticket.contact.lastName}</div>
                            <div className="contact-email">{ticket.contact.email}</div>
                          </>
                        ) : (
                          <span className="no-contact">No contact</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge priority-${ticket.priority.toLowerCase()}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge status-${ticket.status.toLowerCase()}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="category-badge">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="assigned-to">
                        {ticket.assignedUser ? (
                          `${ticket.assignedUser.firstName} ${ticket.assignedUser.lastName}`
                        ) : (
                          <span className="unassigned">Unassigned</span>
                        )}
                      </td>
                      <td className="created-date">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="replies-count">
                        {ticket._count?.replies || 0}
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleEditTicket(ticket)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteTicket(ticket.id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="knowledge-tab">
            <div className="knowledge-header">
              <div className="knowledge-stats">
                <div className="stat-item">
                  <span className="stat-value">{knowledgeBase.length}</span>
                  <span className="stat-label">Total Articles</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{knowledgeBase.filter(k => k.isPublished).length}</span>
                  <span className="stat-label">Published</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{knowledgeBase.filter(k => !k.isPublished).length}</span>
                  <span className="stat-label">Draft</span>
                </div>
              </div>
            </div>

            <div className="knowledge-grid">
              {knowledgeBase.map((article) => (
                <div key={article.id} className="knowledge-card">
                  <div className="knowledge-header">
                    <h3>{article.title}</h3>
                    <span className={`status-badge ${article.isPublished ? 'published' : 'draft'}`}>
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="knowledge-category">
                    <span className="category-badge">{article.category}</span>
                  </div>
                  <div className="knowledge-tags">
                    {article.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                  <div className="knowledge-content">
                    {article.content.substring(0, 150)}...
                  </div>
                  <div className="knowledge-footer">
                    <div className="knowledge-author">
                      By {article.author?.firstName} {article.author?.lastName}
                    </div>
                    <div className="knowledge-date">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="knowledge-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEditKnowledge(article)}
                    >
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteKnowledge(article.id)}
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <div className="analytics-header">
              <div className="date-range-selector">
                <label>Date Range:</label>
                <select value={dateRange} onChange={(e) => handleDateRangeChange(e.target.value)}>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>

            <div className="analytics-grid">
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-ticket-alt"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.totalTickets}</div>
                    <div className="metric-label">Total Tickets</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.openTickets}</div>
                    <div className="metric-label">Open Tickets</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.resolvedTickets}</div>
                    <div className="metric-label">Resolved</div>
                  </div>
                </div>
                <div className="metric-card">
                  <div className="metric-icon">
                    <i className="fas fa-stopwatch"></i>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{analytics.averageResolutionTime}</div>
                    <div className="metric-label">Avg Resolution (days)</div>
                  </div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="chart-section">
                  <h3>Tickets by Status</h3>
                  <div className="status-chart">
                    {analytics.ticketsByStatus.map((item) => (
                      <div key={item.status} className="status-bar">
                        <div className="status-label">{item.status.replace('_', ' ')}</div>
                        <div className="status-bar-container">
                          <div 
                            className={`status-bar-fill status-${item.status.toLowerCase()}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <div className="status-count">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h3>Tickets by Priority</h3>
                  <div className="priority-chart">
                    {analytics.ticketsByPriority.map((item) => (
                      <div key={item.priority} className="priority-bar">
                        <div className="priority-label">{item.priority}</div>
                        <div className="priority-bar-container">
                          <div 
                            className={`priority-bar-fill priority-${item.priority.toLowerCase()}`}
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <div className="priority-count">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h3>Monthly Trends</h3>
                  <div className="trends-chart">
                    {analytics.monthlyTrends.map((item) => (
                      <div key={item.month} className="trend-item">
                        <div className="trend-header">
                          <div className="trend-month">{item.month}</div>
                          <div className="trend-invoices">
                            {item.tickets} tickets, {item.resolved} resolved
                          </div>
                        </div>
                        <div className="trend-bars">
                          <div className="trend-bar">
                            <div className="trend-bar-fill total" style={{ width: `${(item.tickets / 60) * 100}%` }}></div>
                          </div>
                          <div className="trend-bar">
                            <div className="trend-bar-fill resolved" style={{ width: `${(item.resolved / 60) * 100}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="chart-section">
                  <h3>Top Categories</h3>
                  <div className="categories-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topCategories.map((item) => (
                          <tr key={item.category}>
                            <td className="category-name">{item.category.replace('_', ' ')}</td>
                            <td className="category-count">{item.count}</td>
                            <td className="category-percentage">{item.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTicketForm && (
        <TicketForm
          ticket={editingTicket}
          onSave={handleSaveTicket}
          onCancel={() => setShowTicketForm(false)}
        />
      )}

      {showKnowledgeForm && (
        <KnowledgeForm
          knowledge={editingKnowledge}
          onSave={handleSaveKnowledge}
          onCancel={() => setShowKnowledgeForm(false)}
        />
      )}
    </div>
  );
};

export default Support;
