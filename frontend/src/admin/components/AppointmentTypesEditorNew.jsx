import React, { useState, useEffect } from 'react';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';
import { useAdminTranslation } from '../utils/useAdminTranslation';

const styles = `
  @media (max-width: 768px) {
    .appointment-card {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    
    .appointment-card > div:first-child {
      margin-bottom: 1rem;
    }
    
    .appointment-actions {
      width: 100% !important;
      flex-direction: column !important;
    }
    
    .appointment-actions button {
      width: 100% !important;
    }
  }
`;

const AppointmentDetailsModal = ({ isOpen, onClose, appointment, onSave, t }) => {
  const [formData, setFormData] = useState({
    appName: '',
    appPrice: '',
    appDuration: '50',
    appCurrency: 'USD',
    appLanguage: 'en',
    appDescription: '',
    appFeatures: ''
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'PLN', name: 'Polish Złoty (zł)' },
    { code: 'BRL', name: 'Brazilian Real (R$)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pl', name: 'Polski' },
  ];

  useEffect(() => {
    if (appointment) {
      setFormData({
        appName: appointment.appName || '',
        appPrice: appointment.appPrice || '',
        appDuration: appointment.appDuration || '50',
        appCurrency: appointment.appCurrency || 'USD',
        appLanguage: appointment.appLanguage || 'en',
        appDescription: appointment.appDescription || '',
        appFeatures: appointment.appFeatures || ''
      });
    }
  }, [appointment]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.appName.trim()) {
      alert(t('appointmentTypes.errors.nameRequired'));
      return;
    }
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>
          {appointment ? t('appointmentTypes.editAppointment') : t('appointmentTypes.newAppointment')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
                {t('appointmentTypes.fields.name')} *
              </label>
              <input
                type="text"
                value={formData.appName}
                onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                placeholder={t('appointmentTypes.placeholders.name')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
                {t('appointmentTypes.fields.language')} *
              </label>
              <select
                value={formData.appLanguage}
                onChange={(e) => setFormData({ ...formData, appLanguage: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
                {t('appointmentTypes.fields.price')}
              </label>
              <input
                type="number"
                value={formData.appPrice}
                onChange={(e) => setFormData({ ...formData, appPrice: e.target.value })}
                placeholder="120"
                step="0.01"
                min="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
                {t('appointmentTypes.currency')}
              </label>
              <select
                value={formData.appCurrency}
                onChange={(e) => setFormData({ ...formData, appCurrency: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.code}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
                {t('appointmentTypes.fields.minutes')}
              </label>
              <input
                type="text"
                value={formData.appDuration}
                onChange={(e) => setFormData({ ...formData, appDuration: e.target.value })}
                placeholder="50"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
              {t('appointmentTypes.fields.description')}
            </label>
            <textarea
              value={formData.appDescription}
              onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
              placeholder={t('appointmentTypes.placeholders.description')}
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
              {t('appointmentTypes.fields.features')}
            </label>
            <textarea
              value={formData.appFeatures}
              onChange={(e) => setFormData({ ...formData, appFeatures: e.target.value })}
              placeholder={t('appointmentTypes.placeholders.features')}
              rows="4"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '2px solid #ddd',
              background: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {t('appointmentTypes.buttons.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: 'var(--primary-gradient)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem'
            }}
          >
            {t('appointmentTypes.buttons.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

const AppointmentTypesEditorNew = ({ onCancel }) => {
  const { t } = useAdminTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API}/appointment-types`);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data.types || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedAppointment(null);
    setShowDetailsModal(true);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedAppointment) {
        // Update existing
        const response = await authenticatedFetch(`${API}/appointment-types/${selectedAppointment.atid}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
          await fetchAppointments();
          setShowDetailsModal(false);
        }
      } else {
        // Create new
        const response = await authenticatedFetch(`${API}/appointment-types`, {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
          await fetchAppointments();
          setShowDetailsModal(false);
        }
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert(t('appointmentTypes.errors.saveFailed'));
    }
  };

  const handleDelete = async (atid) => {
    if (!confirm(t('appointmentTypes.confirmDelete'))) return;

    try {
      const response = await authenticatedFetch(`${API}/appointment-types/${atid}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        await fetchAppointments();
      } else {
        alert(data.error || t('appointmentTypes.errors.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert(t('appointmentTypes.errors.deleteFailed'));
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('appointmentTypes.loading')}</div>;
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ padding: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Appointment Types List */}
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>{t('appointmentTypes.listTitle')}</h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {appointments.map((appointment) => (
            <div key={appointment.atid} style={{
              background: 'white',
              border: '2px solid #e0e0e0',
              borderRadius: '10px',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              '@media (maxWidth: 768px)': {
                flexDirection: 'column',
                alignItems: 'flex-start'
              }
            }} className="appointment-card">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#2c3e50' }}>
                    {appointment.appName}
                  </div>
                  <span style={{
                    padding: '0.25rem 0.5rem',
                    background: appointment.appLanguage === 'pl' ? '#dc3545' : '#007bff',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {appointment.appLanguage?.toUpperCase() || 'EN'}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {appointment.appDuration} min • {appointment.appPrice ? `${appointment.appPrice} ${appointment.appCurrency}` : t('appointmentTypes.noPriceSet')}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }} className="appointment-actions">
                <button
                  onClick={() => handleEdit(appointment)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {t('appointmentTypes.buttons.edit')}
                </button>
                <button
                  onClick={() => handleDelete(appointment.atid)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {t('appointmentTypes.buttons.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Button */}
      <button
        onClick={handleAddNew}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
          color: 'var(--primary-color)',
          border: '2px dashed var(--primary-color)',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '1rem',
          fontWeight: 600,
          marginBottom: '1rem'
        }}
      >
        + {t('appointmentTypes.addType')}
      </button>

      {/* Close Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e0e0e0' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: '2px solid #ddd',
            background: 'white',
            color: '#666',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {t('appointmentTypes.buttons.close')}
        </button>
      </div>

      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        onSave={handleSave}
        t={t}
      />
      </div>
    </>
  );
};

export default AppointmentTypesEditorNew;
