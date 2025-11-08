import { useState, useEffect } from 'react';
import Modal from '../Modal';
import EmailSettingsEditor from '../EmailSettingsEditor';
import PremiumUpgradeModal from '../PremiumUpgradeModal';
import { API } from '../../../config/api';
import { authenticatedFetch } from '../../utils/apiHelper';
import { useAdminTranslation } from '../../utils/useAdminTranslation';

function EmailConfigModalDesktop({ isOpen, onClose, emailSettings, onSave }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPremium, setIsPremium] = useState(null);
  const { t } = useAdminTranslation();

  useEffect(() => {
    if (isOpen) {
      checkLicense();
    }
  }, [isOpen]);

  const checkLicense = async () => {
    try {
      const res = await authenticatedFetch(`${API}/settings`);
      const data = await res.json();
      if (data.success && data.data.license) {
        const hasEmailFeature = data.data.license.features.emailNotifications;
        setIsPremium(hasEmailFeature);
        if (!hasEmailFeature) {
          setShowUpgrade(true);
        }
      } else {
        setIsPremium(false);
        setShowUpgrade(true);
      }
    } catch (error) {
      console.error('Error checking license:', error);
      setIsPremium(false);
      setShowUpgrade(true);
    }
  };

  const handleUpgradeClose = () => {
    setShowUpgrade(false);
    onClose();
  };

  if (showUpgrade) {
    return (
      <PremiumUpgradeModal
        isOpen={isOpen}
        onClose={handleUpgradeClose}
        onSuccess={() => {
          setIsPremium(true);
          setShowUpgrade(false);
        }}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('emailSettings.modalTitle')} maxWidth="800px" closeOnOverlayClick={false}>
      {emailSettings && isPremium ? (
        <EmailSettingsEditor
          settings={emailSettings}
          onSave={onSave}
          onCancel={onClose}
        />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>{t('settings.loading')}</p>
        </div>
      )}
    </Modal>
  );
}

export default EmailConfigModalDesktop;
