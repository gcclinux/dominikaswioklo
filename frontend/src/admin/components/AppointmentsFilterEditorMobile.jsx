import { useState, useEffect } from 'react';
import './AppointmentsFilterEditorMobile.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

const PRESETS = [7, 14, 30, 90];

function AppointmentsFilterEditorMobile({ pastDays, futureDays, onSave, onCancel }) {
  const { t } = useAdminTranslation();
  const [past, setPast] = useState(pastDays ?? 30);
  const [future, setFuture] = useState(futureDays ?? 30);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPast(pastDays ?? 30);
    setFuture(futureDays ?? 30);
  }, [pastDays, futureDays]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ pastAppointmentsDays: past, futureAppointmentsDays: future });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = (past !== (pastDays ?? 30)) || (future !== (futureDays ?? 30));

  return (
    <div className="mobile-filter-editor">
      <div className="mobile-filter-card">
        <div className="filter-icon">📆</div>
        <div className="filter-header">
          <h3>{t('appointmentsFilter.past')}</h3>
          <p>{t('appointmentsFilter.pastHint')}</p>
        </div>
        <div className="filter-presets">
          {PRESETS.map(v => (
            <button
              key={`past-${v}`}
              className={`preset-btn ${past === v ? 'active' : ''}`}
              onClick={() => setPast(v)}
              disabled={isSaving}
            >
              {v} {t('appointmentsFilter.days')}
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-filter-card">
        <div className="filter-icon">📅</div>
        <div className="filter-header">
          <h3>{t('appointmentsFilter.future')}</h3>
          <p>{t('appointmentsFilter.futureHint')}</p>
        </div>
        <div className="filter-presets">
          {PRESETS.map(v => (
            <button
              key={`future-${v}`}
              className={`preset-btn ${future === v ? 'active' : ''}`}
              onClick={() => setFuture(v)}
              disabled={isSaving}
            >
              {v} {t('appointmentsFilter.days')}
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          {t('appointmentsFilter.preview', { past, future })}
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

export default AppointmentsFilterEditorMobile;
