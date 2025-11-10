import { useState, useEffect } from 'react';
import './DisplayAvailabilityEditorMobile.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function DisplayAvailabilityEditorMobile({ currentValue, onSave, onCancel, min = 1, max = 52 }) {
  const { t } = useAdminTranslation();
  const [value, setValue] = useState(currentValue);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setValue(currentValue); }, [currentValue]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(value);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = value !== currentValue;

  return (
    <div className="mobile-availability-editor">
      <div className="mobile-availability-card">
        <div className="availability-icon">📅</div>
        <div className="availability-header">
          <h3>{t('displayAvailability.weeksAheadLabel')}</h3>
          <p>{t('displayAvailability.helpText')}</p>
        </div>
        <div className="availability-controls">
          <button 
            className="mobile-stepper minus" 
            onClick={() => setValue(Math.max(min, value - 1))} 
            disabled={isSaving || value <= min}
          >
            −
          </button>
          <div className="mobile-value">{value}</div>
          <button 
            className="mobile-stepper plus" 
            onClick={() => setValue(Math.min(max, value + 1))} 
            disabled={isSaving || value >= max}
          >
            +
          </button>
        </div>
  <div className="availability-hint">{t('displayAvailability.recommendedRange')}: 1-8</div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          {value === 1 
            ? t('displayAvailability.previewSingleWeek') 
            : t('displayAvailability.previewMultiWeeks', { weeks: value })}
        </p>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel} disabled={isSaving}>{t('common.cancel')}</button>
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

export default DisplayAvailabilityEditorMobile;
