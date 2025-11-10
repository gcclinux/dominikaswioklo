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
import NewsletterModal from '../components/NewsletterModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LanguageSelector from '../components/LanguageSelector';
import { authenticatedFetch } from '../utils/apiHelper';
import { useAdminTranslation } from '../utils/useAdminTranslation';
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
  const { t } = useAdminTranslation();
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
  const [showDraftConfirm, setShowDraftConfirm] = useState(false);
  const [pendingDraft, setPendingDraft] = useState(null);
  const [loadedDraft, setLoadedDraft] = useState(null);
  const [draftConfirmAction, setDraftConfirmAction] = useState(null);
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

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
        showToast(t('settings.toast.loadFailed'), 'error');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      showToast(t('settings.toast.loadError'), 'error');
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
          emailFooter: t('emailSettings.defaultFooter')
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
        emailFooter: t('emailSettings.defaultFooter')
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
        showToast(t('settings.toast.settingsUpdated'), 'success');
        setActiveModal(null);
      } else {
        showToast(data.error || t('settings.toast.settingsFailed'), 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast(t('settings.toast.settingsError'), 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const closeToast = () => setToast({ ...toast, visible: false });

  const settingsTiles = [
    { id: 'customerLimits', title: t('settings.tiles.customerLimits.title'), description: t('settings.tiles.customerLimits.description'), icon: '📊', color: '#4A90E2' },
    { id: 'workingHours', title: t('settings.tiles.workingHours.title'), description: t('settings.tiles.workingHours.description'), icon: '🕐', color: '#48C9B0' },
    { id: 'displayAvailability', title: t('settings.tiles.displayAvailability.title'), description: t('settings.tiles.displayAvailability.description'), icon: '📅', color: '#AF7AC5' },
    { id: 'availabilityLock', title: t('settings.tiles.availabilityLock.title'), description: t('settings.tiles.availabilityLock.description'), icon: '🔒', color: '#EC7063' },
    { id: 'appointmentsFilter', title: t('settings.tiles.appointmentsFilter.title'), description: t('settings.tiles.appointmentsFilter.description'), icon: '🧮', color: '#2ECC71' },
    { id: 'appointmentTypes', title: t('settings.tiles.appointmentTypes.title'), description: t('settings.tiles.appointmentTypes.description'), icon: '📋', color: '#3498db' },
    { id: 'headerMessage', title: t('settings.tiles.headerMessage.title'), description: t('settings.tiles.headerMessage.description'), icon: '💬', color: '#F39C12' },
    { id: 'siteTheme', title: t('settings.tiles.siteTheme.title'), description: t('settings.tiles.siteTheme.description'), icon: '🎨', color: '#9B59B6' },
    { id: 'emailSettings', title: t('settings.tiles.emailSettings.title'), description: t('settings.tiles.emailSettings.description'), icon: '📧', color: '#E67E22' },
    { id: 'newsletter', title: t('settings.tiles.newsletter.title'), description: t('settings.tiles.newsletter.description'), icon: '📰', color: '#16A085' },
    { id: 'logout', title: t('dashboard.logout'), description: `${currentAdmin?.aName || ''} ${currentAdmin?.aSurname || ''} (${currentAdmin?.email || ''})`, icon: '🚪', color: '#e74c3c', mobileOnly: true },
  ];

  const handleSettingClick = async (setting) => {
    if (setting.id === 'logout') {
      onLogout();
      return;
    }
    if (setting.id === 'emailSettings' && !emailSettings) {
      await fetchEmailSettings();
    }
    if (setting.id === 'newsletter') {
      await checkForDraft();
      return;
    }
    setActiveModal(setting.id);
  };

  const checkForDraft = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/newsletters`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const draft = data.data.find(n => n.status === 'draft');
        if (draft) {
          setPendingDraft(draft);
          setShowDraftConfirm(true);
        } else {
          setLoadedDraft(null);
          setActiveModal('newsletter');
        }
      } else {
        setLoadedDraft(null);
        setActiveModal('newsletter');
      }
    } catch (error) {
      setLoadedDraft(null);
      setActiveModal('newsletter');
    }
  };

  useEffect(() => {
    if (draftConfirmAction === 'load') {
      setLoadedDraft(pendingDraft);
      setShowDraftConfirm(false);
      setActiveModal('newsletter');
      setDraftConfirmAction(null);
      setPendingDraft(null);
    } else if (draftConfirmAction === 'skip') {
      setLoadedDraft(null);
      setShowDraftConfirm(false);
      setActiveModal('newsletter');
      setDraftConfirmAction(null);
      setPendingDraft(null);
    }
  }, [draftConfirmAction, pendingDraft]);

  const handleLoadDraft = () => {
    setDraftConfirmAction('load');
  };

  const handleSkipDraft = () => {
    setDraftConfirmAction('skip');
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
        showToast(t('settings.toast.emailUpdated'), 'success');
        setActiveModal(null);
      } else {
        showToast(data.error || t('settings.toast.emailFailed'), 'error');
      }
    } catch (error) {
      console.error('Error updating email settings:', error);
      showToast(t('settings.toast.emailError'), 'error');
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
        showToast(t('settings.toast.appointmentTypesUpdated'), 'success');
        setActiveModal(null);
      } else {
        showToast(result.error || t('settings.toast.appointmentTypesFailed'), 'error');
      }
    } catch (error) {
      console.error('Error updating appointment types:', error);
      showToast(t('settings.toast.appointmentTypesError'), 'error');
    }
  };

  const handleSaveNewsletter = async (data) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/newsletters`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        showToast(t('settings.toast.newsletterSaved'), 'success');
        setActiveModal(null);
      } else {
        showToast(result.error || t('settings.toast.newsletterFailed'), 'error');
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      showToast(t('settings.toast.newsletterError'), 'error');
    }
  };

  const handleSubmitNewsletter = async (data, draftId) => {
    setIsSubmittingNewsletter(true);
    try {
      const response = await authenticatedFetch(`${API_BASE}/newsletters/send`, {
        method: 'POST',
        body: JSON.stringify({ ...data, draftId }),
      });
      const result = await response.json();
      if (result.success) {
        showToast(`Newsletter sent successfully to ${result.data.sentCount} users!`, 'success');
        setActiveModal(null);
        setLoadedDraft(null);
      } else {
        showToast(result.error || 'Failed to send newsletter', 'error');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      showToast('Error sending newsletter', 'error');
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('settings.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <header className="settings-header settings-page-header" style={{ textAlign: 'left' }}>
        <div className="settings-header-content">
          <div className="settings-header-left">
            <button className="back-button desktop-back" onClick={onBack}>← {t('settings.backButton')}</button>
            <div className="settings-header-title">
              <h1 style={{ margin: 0, textAlign: 'left' }}>⚙️ {t('settings.pageTitle')} {isDevelopmentMode && <span style={{ color: '#f39c12', fontSize: '0.8rem' }}>🚧 {t('dashboard.devMode')}</span>}</h1>
              <p className="settings-subtitle" style={{ margin: 0, textAlign: 'left' }}>{t('settings.pageSubtitle')}</p>
              <button className="back-button mobile-back" onClick={onBack}>← {t('settings.backButton')}</button>
            </div>
          </div>

          {currentAdmin && (
            <div className="settings-header-right">
              <LanguageSelector compact={true} />
              <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#fff', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                <div>{t('dashboard.welcome')}, <strong>{currentAdmin.aName} {currentAdmin.aSurname}</strong></div>
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
                title={isDevelopmentMode ? t('dashboard.logoutDisabled') : t('dashboard.logout')}
              >
                {isDevelopmentMode ? t('dashboard.devModeActive') : t('dashboard.logout')}
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
              {!setting.mobileOnly && <div className="setting-action"><span className="action-label">{t('settings.configure')} →</span></div>}
            </div>
          ))}
        </div>
      </main>

      <footer className="settings-footer">
        <p>{t('settings.footer')}</p>
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

  <Modal isOpen={activeModal === 'siteTheme'} onClose={() => setActiveModal(null)} title={t('settings.tiles.siteTheme.title')} maxWidth="650px">
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
          showToast(t('settings.toast.premiumActivated'), 'success');
          fetchSettings();
        }}
      />

      <ConfirmDialog
        isOpen={showDraftConfirm}
        onClose={() => handleSkipDraft()}
        onConfirm={() => handleLoadDraft()}
        title={t('confirmDialog.draftFound')}
        message={t('confirmDialog.draftMessage')}
      />

      <NewsletterModal
        isOpen={activeModal === 'newsletter'}
        onClose={() => {
          setActiveModal(null);
          setLoadedDraft(null);
          setPendingDraft(null);
        }}
        onSave={handleSaveNewsletter}
        onSubmit={handleSubmitNewsletter}
        draftData={loadedDraft}
        isSubmitting={isSubmittingNewsletter}
      />
    </div>
  );
}

export default Settings;
