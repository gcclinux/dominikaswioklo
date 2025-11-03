import { useState, useEffect } from 'react';
import Modal from '../Modal';
import EmailSettingsEditor from '../EmailSettingsEditor';
import PremiumUpgradeModal from '../PremiumUpgradeModal';
import { API } from '../../../config/api';
import { authenticatedFetch } from '../../utils/apiHelper';

function EmailConfigModalDesktop({ isOpen, onClose, emailSettings, onSave }) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPremium, setIsPremium] = useState(null);

  useEffect(() => {
    if (isOpen) {
      checkLicense();
    }
  }, [isOpen]);

  const checkLicense = async () => {
    try {
      const res = await authenticatedFetch(`${API}/api/settings`);
      const data = await res.json();
      if (data.success && data.data.license) {
        setIsPremium(data.data.license.features.emailNotifications);
        if (!data.data.license.features.emailNotifications) {
          setShowUpgrade(true);
        }
      } else {
        setIsPremium(false);
        setShowUpgrade(true);
      }
    } catch (error) {
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
    <Modal isOpen={isOpen} onClose={onClose} title="📧 Email Configuration" maxWidth="800px" closeOnOverlayClick={false}>
      {emailSettings && isPremium ? (
        <EmailSettingsEditor
          settings={emailSettings}
          onSave={onSave}
          onCancel={onClose}
        />
      ) : (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="loading-spinner"></div>
          <p>Loading email settings...</p>
        </div>
      )}
    </Modal>
  );
}

export default EmailConfigModalDesktop;
