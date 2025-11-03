import React, { useState, useEffect } from 'react';
import './Settings.css';
import { API } from '../../config/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import AvailabilityLockEditor from '../components/AvailabilityLockEditor';
import AvailabilityLockEditorMobile from '../components/AvailabilityLockEditorMobile';
import BrandingFooter from '../../components/BrandingFooter';
import PremiumUpgradeModal from '../components/PremiumUpgradeModal';
import ThemeSelector from '../components/ThemeSelector';
import { authenticatedFetch } from '../utils/apiHelper';
import {
  CustomerLimitsModalDesktop,
  CustomerLimitsModalMobile,
  WorkingHoursModalDesktop,
  WorkingHoursModalMobile,
  DisplayAvailabilityModalDesktop,
  DisplayAvailabilityModalMobile,
  AppointmentsFilterModalDesktop,
  AppointmentsFilterModalMobile,
  AppointmentDetailsModalDesktop,
  AppointmentDetailsModalMobile,
  HeaderMessageModalDesktop,
  HeaderMessageModalMobile,
  EmailConfigModalDesktop,
  EmailConfigModalMobile,
} from '../components/modals';

const API_BASE = API;

function Settings({ onBack, currentAdmin, onLogout, isDevelopmentMode }) {
  const [settings, setSettings] = useState(null);
  const [emailSettings, setEmailSettings] = useState(null);
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [appointmentCurrency, setAppointmentCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    fetchSettings();
    fetchEmailSettings();
    fetchAppointmentTypes();

    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (settings?.license) {
      setIsPremium(settings.license.isPremium && settings.license.features?.emailNotifications);
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings`);
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
      } else {
        showToast('Failed to load settings', 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailSettings = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/email-settings`);
      const data = await response.json();
      if (data.success) {
        setEmailSettings(data.data);
      } else {
        console.error('Email settings fetch failed:', data.error);
        setEmailSettings({
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpSecure: 0,
          smtpUser: '',
          smtpPass: '',
          smtpFrom: '',
          emailFooter: 'Scheduler System'
        });
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      setEmailSettings({
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: 0,
        smtpUser: '',
        smtpPass: '',
        smtpFrom: '',
        emailFooter: 'Scheduler System'
      });
    }
  };

  const fetchAppointmentTypes = async () => {
    try {
      const response = await fetch(`${API_BASE}/appointment-types`);
      const data = await response.json();
      if (data.success) {
        setAppointmentTypes(data.data.types || []);
        setAppointmentCurrency(data.data.currency || 'USD');
      }
    } catch (error) {
      console.error('Error fetching appointment types:', error);
      setAppointmentTypes([]);
      setAppointmentCurrency('USD');
    }
  };

  const updateSetting = async (updates) => {
    try {
      console.log('updateSetting called with:', updates);
      const response = await authenticatedFetch(`${API_BASE}/settings`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      console.log('API response:', data);
      if (data.success) {
        await fetchSettings();
        showToast('Settings updated successfully!', 'success');
        setActiveModal(null);
      } else {
        showToast(data.error || 'Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Error updating settings', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const closeToast = () => setToast({ ...toast, visible: false });

  const settingsTiles = [
    { id: 'customerLimits', title: 'Customer Booking Limits', description: 'Set daily and weekly appointment limits per customer', icon: '📊', color: '#4A90E2' },
    { id: 'workingHours', title: 'Working Days & Hours', description: 'Configure business start and end hours', icon: '🕐', color: '#48C9B0' },
    { id: 'displayAvailability', title: 'Display Availability', description: 'Number of weeks ahead to show availability', icon: '📅', color: '#AF7AC5' },
    { id: 'availabilityLock', title: 'Availability Lock', description: 'Lock/unlock booking availability (availabilityLocked & availabilityLockedUntil)', icon: '🔒', color: '#EC7063' },
    { id: 'appointmentsFilter', title: 'Appointments Filter', description: 'Control how many days of past and future appointments to show in admin lists', icon: '🧮', color: '#2ECC71' },
    { id: 'appointmentTypes', title: 'Appointment Details', description: 'Create and manage appointment types with names and prices', icon: '📋', color: '#3498db' },
    { id: 'headerMessage', title: 'Header Message', description: 'Customize the calendar header message displayed to users', icon: '💬', color: '#F39C12' },
    { id: 'siteTheme', title: 'Site Theme', description: 'Choose between purple gradient or dark green theme', icon: '🎨', color: '#9B59B6' },
    { id: 'emailSettings', title: 'Email Configuration', description: 'Configure SMTP settings for automated email notifications', icon: '📧', color: '#E67E22' },
    { id: 'logout', title: 'Logout', description: `${currentAdmin?.aName || ''} ${currentAdmin?.aSurname || ''} (${currentAdmin?.email || ''})`, icon: '🚪', color: '#e74c3c', mobileOnly: true },
  ];

  const handleSettingClick = async (setting) => {
    if (setting.id === 'logout') {
      onLogout();
      return;
    }
    if (setting.id === 'emailSettings' && !emailSettings) {
      await fetchEmailSettings();
    }
    setActiveModal(setting.id);
  };

  const handleSaveDisplayAvailability = async (newValue) => updateSetting({ displayAvailability: newValue });
  const handleSaveWorkingHours = async ({ startHour, endHour, includeWeekend, allow30Min }) => updateSetting({ startHour, endHour, includeWeekend, allow30Min });
  const handleSaveAvailabilityLock = async (payload) => updateSetting(payload);
  const handleSaveHeaderMessage = async (payload) => updateSetting(payload);
  const handleSaveTheme = async (payload) => {
    await updateSetting(payload);
    window.location.reload();
  };
  const handleSaveCustomerLimits = async ({ maxApp, maxAppWeek }) => updateSetting({ maxApp, maxAppWeek });
  const handleSaveAppointmentsFilter = async ({ pastAppointmentsDays, futureAppointmentsDays }) => updateSetting({ pastAppointmentsDays, futureAppointmentsDays });

  const handleSaveEmailSettings = async (updates) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/email-settings`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (data.success) {
        await fetchEmailSettings();
        showToast('Email settings updated successfully!', 'success');
        setActiveModal(null);
      } else {
        showToast(data.error || 'Failed to update email settings', 'error');
      }
    } catch (error) {
      console.error('Error updating email settings:', error);
      showToast('Error updating email settings', 'error');
    }
  };

  const handleSaveAppointmentTypes = async (data) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/appointment-types`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        await fetchAppointmentTypes();
        showToast('Appointment types updated successfully!', 'success');
        setActiveModal(null);
      } else {
        showToast(result.error || 'Failed to update appointment types', 'error');
      }
    } catch (error) {
      console.error('Error updating appointment types:', error);
      showToast('Error updating appointment types', 'error');
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="settings-header settings-page-header" style={{ textAlign: 'left' }}>
        <div className="settings-header-content">
          <div className="settings-header-left">
            <button className="back-button desktop-back" onClick={onBack}>← Back</button>
            <div className="settings-header-title">
              <h1 style={{ margin: 0, textAlign: 'left' }}>⚙️ System Settings {isDevelopmentMode && <span style={{ color: '#f39c12', fontSize: '0.8rem' }}>🚧 DEV MODE</span>}</h1>
              <p className="settings-subtitle" style={{ margin: 0, textAlign: 'left' }}>Configure your appointment scheduler</p>
              <button className="back-button mobile-back" onClick={onBack}>← Back</button>
            </div>
          </div>

          {currentAdmin && (
            <div className="settings-header-right">
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#fff', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                <div>Welcome, <strong>{currentAdmin.aName} {currentAdmin.aSurname}</strong></div>
                <div style={{ fontSize: '0.85rem', opacity: 0.95 }}>{currentAdmin.email}</div>
              </div>
              <button
                onClick={onLogout}
                style={{
                  padding: '0.5rem 1rem',
                  background: isDevelopmentMode ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isDevelopmentMode ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}
                title={isDevelopmentMode ? 'Logout disabled in development mode' : 'Logout'}
              >
                {isDevelopmentMode ? 'Dev Mode' : 'Logout'}
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="settings-main">
        <div className="settings-grid">
          {settingsTiles.map((setting) => (
            <div key={setting.id} className="setting-tile" style={{ '--setting-color': setting.color }} onClick={() => handleSettingClick(setting)} data-mobile-only={setting.mobileOnly || false}>
              <div className="setting-icon">{setting.icon}</div>
              <h3 className="setting-title">{setting.title}</h3>
              <p className="setting-description">{setting.description}</p>
              {!setting.mobileOnly && <div className="setting-action"><span className="action-label">Configure →</span></div>}
            </div>
          ))}
        </div>
      </main>

      <footer className="settings-footer">
        <p>All changes are saved automatically</p>
        <BrandingFooter isPremium={isPremium} />
      </footer>

      {isMobile ? (
        <CustomerLimitsModalMobile
          isOpen={activeModal === 'customerLimits'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveCustomerLimits}
        />
      ) : (
        <CustomerLimitsModalDesktop
          isOpen={activeModal === 'customerLimits'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveCustomerLimits}
        />
      )}

      {isMobile ? (
        <WorkingHoursModalMobile
          isOpen={activeModal === 'workingHours'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveWorkingHours}
        />
      ) : (
        <WorkingHoursModalDesktop
          isOpen={activeModal === 'workingHours'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveWorkingHours}
        />
      )}

      {isMobile ? (
        <Modal isOpen={activeModal === 'availabilityLock'} onClose={() => setActiveModal(null)} title="🔒 Lock Status" maxWidth="100%">
          {settings && (
            <AvailabilityLockEditorMobile
              availabilityLocked={settings.availabilityLocked}
              availabilityLockedUntil={settings.availabilityLockedUntil}
              onSave={handleSaveAvailabilityLock}
              onCancel={() => setActiveModal(null)}
            />
          )}
        </Modal>
      ) : (
        <Modal isOpen={activeModal === 'availabilityLock'} onClose={() => setActiveModal(null)} title="🔒 Availability Lock" maxWidth="600px">
          {settings && (
            <AvailabilityLockEditor
              availabilityLocked={settings.availabilityLocked}
              availabilityLockedUntil={settings.availabilityLockedUntil}
              onSave={handleSaveAvailabilityLock}
              onCancel={() => setActiveModal(null)}
            />
          )}
        </Modal>
      )}

      {isMobile ? (
        <HeaderMessageModalMobile
          isOpen={activeModal === 'headerMessage'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveHeaderMessage}
        />
      ) : (
        <HeaderMessageModalDesktop
          isOpen={activeModal === 'headerMessage'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveHeaderMessage}
        />
      )}

      {isMobile ? (
        <DisplayAvailabilityModalMobile
          isOpen={activeModal === 'displayAvailability'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveDisplayAvailability}
        />
      ) : (
        <DisplayAvailabilityModalDesktop
          isOpen={activeModal === 'displayAvailability'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveDisplayAvailability}
        />
      )}

      {isMobile ? (
        <AppointmentsFilterModalMobile
          isOpen={activeModal === 'appointmentsFilter'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveAppointmentsFilter}
        />
      ) : (
        <AppointmentsFilterModalDesktop
          isOpen={activeModal === 'appointmentsFilter'}
          onClose={() => setActiveModal(null)}
          settings={settings}
          onSave={handleSaveAppointmentsFilter}
        />
      )}

      {isMobile ? (
        <AppointmentDetailsModalMobile
          isOpen={activeModal === 'appointmentTypes'}
          onClose={() => setActiveModal(null)}
        />
      ) : (
        <AppointmentDetailsModalDesktop
          isOpen={activeModal === 'appointmentTypes'}
          onClose={() => setActiveModal(null)}
        />
      )}

      {isMobile ? (
        <EmailConfigModalMobile
          isOpen={activeModal === 'emailSettings'}
          onClose={() => setActiveModal(null)}
          emailSettings={emailSettings}
          onSave={handleSaveEmailSettings}
        />
      ) : (
        <EmailConfigModalDesktop
          isOpen={activeModal === 'emailSettings'}
          onClose={() => setActiveModal(null)}
          emailSettings={emailSettings}
          onSave={handleSaveEmailSettings}
        />
      )}

      <Modal isOpen={activeModal === 'siteTheme'} onClose={() => setActiveModal(null)} title="🎨 Site Theme" maxWidth="650px">
        {settings && (
          <ThemeSelector
            currentTheme={settings.siteTheme || 'purple'}
            onSave={handleSaveTheme}
            onCancel={() => setActiveModal(null)}
          />
        )}
      </Modal>

      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={closeToast} />
      
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          showToast('Premium activated! Restart server to apply changes.', 'success');
          fetchSettings();
        }}
      />
    </div>
  );
}

export default Settings;
