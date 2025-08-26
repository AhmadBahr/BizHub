import React from 'react';
import type { Contact } from '../../types';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import './ContactList.css';

interface ContactListProps {
  contacts: Contact[];
  isLoading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isLoading,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="contact-list-loading">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  if (!contacts || contacts.length === 0) {
    return (
      <div className="contact-list-empty">
        <p>No contacts found</p>
      </div>
    );
  }

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'prospect':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="contact-list">
      <div className="contact-table-container">
        <table className="table contact-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id}>
                <td>
                  <div className="contact-name">
                    {contact.firstName} {contact.lastName}
                  </div>
                </td>
                <td>{contact.email}</td>
                <td>{contact.company || '-'}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(contact.status)}`}>
                    {contact.status}
                  </span>
                </td>
                <td>
                  <div className="contact-tags">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="contact-tag">
                        {tag}
                      </span>
                    ))}
                    {contact.tags.length > 2 && (
                      <span className="contact-tag-more">
                        +{contact.tags.length - 2}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="contact-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onEdit(contact)}
                      title="Edit contact"
                    >
                      <PencilIcon className="action-icon" />
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onDelete(contact.id)}
                      title="Delete contact"
                    >
                      <TrashIcon className="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ContactList;
