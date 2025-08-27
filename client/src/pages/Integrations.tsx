import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { 
  fetchIntegrations, 
  createIntegration, 
  updateIntegration, 
  deleteIntegration,
  toggleIntegration,
  testIntegration,
  setSelectedIntegration,
  clearError
} from '../store/slices/integrationsSlice';
import IntegrationCard from '../components/Integrations/IntegrationCard';
import IntegrationModal from '../components/Integrations/IntegrationModal';
import './Integrations.css';

const Integrations: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    integrations, 
    selectedIntegration, 
    isLoading, 
    error, 
    activeIntegrations 
  } = useAppSelector((state) => state.integrations);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    dispatch(fetchIntegrations());
  }, [dispatch]);

  const handleCreateIntegration = async (integrationData: any) => {
    try {
      await dispatch(createIntegration(integrationData)).unwrap();
      setShowModal(false);
      dispatch(fetchIntegrations());
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const handleUpdateIntegration = async (integrationData: any) => {
    if (!selectedIntegration) return;
    
    try {
      await dispatch(updateIntegration({ id: selectedIntegration.id, data: integrationData })).unwrap();
      setShowModal(false);
      setIsEditing(false);
      dispatch(setSelectedIntegration(null));
      dispatch(fetchIntegrations());
    } catch (error) {
      console.error('Failed to update integration:', error);
    }
  };

  const handleDeleteIntegration = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this integration?')) {
      try {
        await dispatch(deleteIntegration(id)).unwrap();
        dispatch(fetchIntegrations());
      } catch (error) {
        console.error('Failed to delete integration:', error);
      }
    }
  };

  const handleEditIntegration = (integration: any) => {
    dispatch(setSelectedIntegration(integration));
    setIsEditing(true);
    setShowModal(true);
  };

  const handleViewIntegration = (integration: any) => {
    dispatch(setSelectedIntegration(integration));
    setIsEditing(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEditing(false);
    dispatch(setSelectedIntegration(null));
  };

  const handleToggleIntegration = async (id: string, isActive: boolean) => {
    try {
      await dispatch(toggleIntegration({ id, isActive })).unwrap();
      dispatch(fetchIntegrations());
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }
  };

  const handleTestIntegration = async (id: string) => {
    try {
      await dispatch(testIntegration(id)).unwrap();
      // Optionally refresh integrations to show updated lastTested
      dispatch(fetchIntegrations());
    } catch (error) {
      console.error('Failed to test integration:', error);
    }
  };

  if (error) {
    return (
      <div className="integrations-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      </div>
    );
  }

  return (
    <div className="integrations-page">
      <div className="integrations-header">
        <div className="header-content">
          <h1 className="integrations-title">Integrations</h1>
          <p className="integrations-subtitle">Connect your business tools and automate workflows</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + Add Integration
          </button>
        </div>
      </div>

      <div className="integrations-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading integrations...</p>
          </div>
        ) : (
          <div className="integrations-grid">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                isActive={activeIntegrations.includes(integration.id)}
                onEdit={() => handleEditIntegration(integration)}
                onView={() => handleViewIntegration(integration)}
                onDelete={() => handleDeleteIntegration(integration.id)}
                onToggle={(isActive) => handleToggleIntegration(integration.id, isActive)}
                onTest={() => handleTestIntegration(integration.id)}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <IntegrationModal
          integration={selectedIntegration}
          isEditing={isEditing}
          onSubmit={isEditing ? handleUpdateIntegration : handleCreateIntegration}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Integrations;
