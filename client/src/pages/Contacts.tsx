import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchContacts, 
  setSearchTerm, 
  setStatusFilter, 
  setPage,
  deleteContact 
} from '../store/slices/contactsSlice';
import ContactForm from '../components/Contacts/ContactForm';
import ContactList from '../components/Contacts/ContactList';
import ContactFilters from '../components/Contacts/ContactFilters';
import './Contacts.css';

const Contacts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { contacts, isLoading, total, page, limit } = useAppSelector((state) => state.contacts);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchContacts({ page, limit }));
  }, [dispatch, page, limit]);

  const handleSearch = (search: string) => {
    dispatch(setSearchTerm(search));
    dispatch(fetchContacts({ page: 1, limit, search }));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setStatusFilter(status));
    dispatch(fetchContacts({ page: 1, limit, status }));
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      await dispatch(deleteContact(id));
      dispatch(fetchContacts({ page, limit }));
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingContact(null);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingContact(null);
    dispatch(fetchContacts({ page, limit }));
  };

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <div className="contacts-title-section">
          <h1 className="contacts-title">Contacts</h1>
          <p className="contacts-subtitle">Manage your business contacts and relationships</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add Contact
        </button>
      </div>

      <ContactFilters 
        onSearch={handleSearch}
        onStatusFilter={handleStatusFilter}
      />

      <ContactList 
        contacts={contacts}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={handlePageChange}
      />

      {showForm && (
        <ContactForm
          contact={editingContact}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

export default Contacts;





