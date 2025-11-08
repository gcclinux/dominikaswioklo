import { useState } from 'react';
import './EmailSettingsEditorMobile.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function EmailSettingsEditorMobile({ settings, onSave, onCancel }) {
  const { t } = useAdminTranslation();
  const [formData, setFormData] = useState({
    smtpHost: settings.smtpHost || 'smtp.gmail.com',
    smtpPort: settings.smtpPort || 587,
    smtpSecure: settings.smtpSecure === 1,
    smtpUser: settings.smtpUser || '',
    smtpPass: settings.smtpPass === '********' ? '' : settings.smtpPass || '',
    smtpFrom: settings.smtpFrom || '',
  emailFooter: settings.emailFooter || t('emailSettings.defaultFooter')
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = { ...formData };
    if (!payload.smtpPass) delete payload.smtpPass;
    onSave(payload);
  };

  return (
    <div className="mobile-email-editor">
      <div className="mobile-email-field">
  <label>{t('emailSettings.host')}</label>
        <input
          type="text"
          value={formData.smtpHost}
          onChange={(e) => handleChange('smtpHost', e.target.value)}
          placeholder="smtp.gmail.com"
        />
      </div>

      <div className="mobile-email-row">
        <div className="mobile-email-field">
          <label>{t('emailSettings.port')}</label>
          <input
            type="number"
            value={formData.smtpPort}
            onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
          />
        </div>
        <div className="mobile-email-field">
          <label className="mobile-checkbox-label">
            <input
              type="checkbox"
              checked={formData.smtpSecure}
              onChange={(e) => handleChange('smtpSecure', e.target.checked)}
            />
            <span>{t('emailSettings.useSslTls')}</span>
          </label>
        </div>
      </div>

      <div className="mobile-email-field">
  <label>{t('emailSettings.emailAddress')}</label>
        <input
          type="email"
          value={formData.smtpUser}
          onChange={(e) => handleChange('smtpUser', e.target.value)}
          placeholder="your-email@gmail.com"
        />
      </div>

      <div className="mobile-email-field">
  <label>{t('emailSettings.password')}</label>
        <input
          type="password"
          value={formData.smtpPass}
          onChange={(e) => handleChange('smtpPass', e.target.value)}
          placeholder={settings.smtpPass === '********' ? 'Leave empty to keep current' : 'App password'}
        />
        <small>
          {t('emailSettings.gmailHint')} <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer">{t('emailSettings.here')}</a>
        </small>
      </div>

      <div className="mobile-email-field">
  <label>{t('emailSettings.fromEmail')}</label>
        <input
          type="email"
          value={formData.smtpFrom}
          onChange={(e) => handleChange('smtpFrom', e.target.value)}
          placeholder="noreply@yourdomain.com"
        />
      </div>

      <div className="mobile-email-field">
  <label>{t('emailSettings.emailFooter')}</label>
        <input
          type="text"
          value={formData.emailFooter}
          onChange={(e) => handleChange('emailFooter', e.target.value)}
          placeholder={t('emailSettings.defaultFooter')}
        />
  <small>{t('emailSettings.footerHint')}</small>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel}>{t('common.cancel')}</button>
        <button className="mobile-btn save" onClick={handleSubmit}>{t('emailSettings.saveSettings')}</button>
      </div>
    </div>
  );
}

export default EmailSettingsEditorMobile;
