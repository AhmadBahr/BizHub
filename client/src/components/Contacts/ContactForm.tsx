import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '../../hooks/redux';
import { createContact, updateContact } from '../../store/slices/contactsSlice';
import type { Contact } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './ContactForm.css';

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
  tags: z.string().optional(),
  notes: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Type for the actual contact data that gets sent to the API
type ContactData = Omit<ContactFormData, 'tags'> & {
  tags: string[];
};

interface ContactFormProps {
  contact?: Contact | null;
  onClose: () => void;
  onSubmit: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ contact, onClose, onSubmit }) => {
  const dispatch = useAppDispatch();
  const isEditing = !!contact;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      status: 'active',
      tags: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (contact) {
      setValue('firstName', contact.firstName);
      setValue('lastName', contact.lastName);
      setValue('email', contact.email);
      setValue('phone', contact.phone || '');
      setValue('company', contact.company || '');
      setValue('position', contact.position || '');
      setValue('status', contact.status as 'active' | 'inactive' | 'prospect');
      setValue('tags', contact.tags.join(', '));
      setValue('notes', contact.notes || '');
    }
  }, [contact, setValue]);

  const handleFormSubmit = async (formData: ContactFormData) => {
    try {
      // Transform form data to API format
      const contactData: ContactData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
      };

      if (isEditing && contact) {
        await dispatch(updateContact({ id: contact.id, data: contactData })).unwrap();
      } else {
        await dispatch(createContact(contactData)).unwrap();
      }
      onSubmit();
      reset();
    } catch (error) {
      console.error('Failed to save contact:', error);
    }
  };

  return (
    <div className="contact-form-overlay">
      <div className="contact-form-modal">
        <div className="contact-form-header">
          <h2 className="contact-form-title">
            {isEditing ? 'Edit Contact' : 'Add New Contact'}
          </h2>
          <button className="close-button" onClick={onClose}>
            <XMarkIcon className="close-icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="contact-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name *
              </label>
              <input
                {...register('firstName')}
                type="text"
                id="firstName"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Enter first name"
              />
              {errors.firstName && (
                <span className="form-error">{errors.firstName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name *
              </label>
              <input
                {...register('lastName')}
                type="text"
                id="lastName"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Enter last name"
              />
              {errors.lastName && (
                <span className="form-error">{errors.lastName.message}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                Phone
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="form-input"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="company" className="form-label">
                Company
              </label>
              <input
                {...register('company')}
                type="text"
                id="company"
                className="form-input"
                placeholder="Enter company name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="position" className="form-label">
                Position
              </label>
              <input
                {...register('position')}
                type="text"
                id="position"
                className="form-input"
                placeholder="Enter job position"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status *
              </label>
              <select
                {...register('status')}
                id="status"
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags" className="form-label">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                id="tags"
                className="form-input"
                placeholder="Enter tags (comma separated)"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Notes
            </label>
            <textarea
              {...register('notes')}
              id="notes"
              className="form-input"
              rows={3}
              placeholder="Enter additional notes"
            />
          </div>

          <div className="contact-form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                isEditing ? 'Update Contact' : 'Create Contact'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
