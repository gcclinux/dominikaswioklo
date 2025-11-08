import { useState } from 'react';
import './CustomerLimitsEditorMobile.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function CustomerLimitsEditorMobile({ maxApp, maxAppWeek, onSave, onCancel }) {
  const { t } = useAdminTranslation();
  const [dailyLimit, setDailyLimit] = useState(maxApp);
  const [weeklyLimit, setWeeklyLimit] = useState(maxAppWeek);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ maxApp: dailyLimit, maxAppWeek: weeklyLimit });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = dailyLimit !== maxApp || weeklyLimit !== maxAppWeek;

  return (
    <div className="mobile-limits-editor">
      <div className="mobile-limit-card">
        <div className="card-icon">📅</div>
        <div className="card-header">
          <h3>{t('customerLimits.dailyLimit')}</h3>
          <p>{t('customerLimits.perCustomerPerDay')}</p>
        </div>
        <div className="card-controls">
          <button 
            className="mobile-stepper minus" 
            onClick={() => setDailyLimit(Math.max(1, dailyLimit - 1))} 
            disabled={isSaving || dailyLimit <= 1}
          >
            −
          </button>
          <div className="mobile-value">{dailyLimit}</div>
          <button 
            className="mobile-stepper plus" 
            onClick={() => setDailyLimit(Math.min(10, dailyLimit + 1))} 
            disabled={isSaving || dailyLimit >= 10}
          >
            +
          </button>
        </div>
  <div className="card-hint">{t('customerLimits.recommended')}: 1-2</div>
      </div>

      <div className="mobile-limit-card">
        <div className="card-icon">📊</div>
        <div className="card-header">
          <h3>{t('customerLimits.weeklyLimit')}</h3>
          <p>{t('customerLimits.perCustomerPerWeek')}</p>
        </div>
        <div className="card-controls">
          <button 
            className="mobile-stepper minus" 
            onClick={() => setWeeklyLimit(Math.max(1, weeklyLimit - 1))} 
            disabled={isSaving || weeklyLimit <= 1}
          >
            −
          </button>
          <div className="mobile-value">{weeklyLimit}</div>
          <button 
            className="mobile-stepper plus" 
            onClick={() => setWeeklyLimit(Math.min(20, weeklyLimit + 1))} 
            disabled={isSaving || weeklyLimit >= 20}
          >
            +
          </button>
        </div>
  <div className="card-hint">{t('customerLimits.recommended')}: 3-5</div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          {t('customerLimits.previewText', {
            dailyLimit,
            dailyPlural: dailyLimit === 1 ? '' : 's',
            weeklyLimit,
            weeklyPlural: weeklyLimit === 1 ? '' : 's'
          })}
        </p>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel} disabled={isSaving}>
          {t('common.cancel')}
        </button>
        <button 
          className="mobile-btn save" 
          onClick={handleSave} 
          disabled={!hasChanged || isSaving}
        >
          {isSaving ? t('workingHours.saving') : t('workingHours.saveChanges')}
        </button>
      </div>
    </div>
  );
}

export default CustomerLimitsEditorMobile;
