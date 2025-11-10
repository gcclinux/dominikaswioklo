import { useState, useEffect } from 'react';
import './AvailabilityLockEditorMobile.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function toLocalDateTimeString(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AvailabilityLockEditorMobile({ availabilityLocked, availabilityLockedUntil, onSave, onCancel }) {
  const { t } = useAdminTranslation();
  const [locked, setLocked] = useState(Boolean(availabilityLocked));
  const [untilLocal, setUntilLocal] = useState(toLocalDateTimeString(availabilityLockedUntil));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocked(Boolean(availabilityLocked));
    setUntilLocal(toLocalDateTimeString(availabilityLockedUntil));
  }, [availabilityLocked, availabilityLockedUntil]);

  const validate = () => {
    if (locked && untilLocal) {
      const chosen = new Date(untilLocal);
      const now = new Date();
      if (isNaN(chosen.getTime())) { setError(t('availabilityLock.errors.invalidFormat')); return false; }
      if (chosen <= now) { setError(t('availabilityLock.errors.mustBeFuture')); return false; }
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload = {
        availabilityLocked: locked ? 1 : 0,
        availabilityLockedUntil: locked && untilLocal ? new Date(untilLocal).toISOString() : null,
      };
      await onSave(payload);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mobile-lock-editor">
      <div className="mobile-lock-card">
        <div className="lock-icon">{locked ? '🔒' : '🔓'}</div>
        <div className="lock-header">
          <h3>{t('availabilityLock.mobileHeader')}</h3>
          <p>{t('availabilityLock.mobileSubheader')}</p>
        </div>
        
        <div className="lock-toggle-group">
          <button 
            className={`lock-option ${locked ? 'active' : ''}`}
            onClick={() => setLocked(true)}
            disabled={isSaving}
          >
            <span className="option-emoji">🔒</span>
            <span>{t('availabilityLock.locked')}</span>
          </button>
          <button 
            className={`lock-option ${!locked ? 'active' : ''}`}
            onClick={() => setLocked(false)}
            disabled={isSaving}
          >
            <span className="option-emoji">🔓</span>
            <span>{t('availabilityLock.open')}</span>
          </button>
        </div>
      </div>

      {locked && (
        <div className="mobile-datetime-card">
          <div className="datetime-header">
            <div className="datetime-icon">⏰</div>
            <div>
              <h4>{t('availabilityLock.autoUnlockLabel')}</h4>
              <p>{t('availabilityLock.autoUnlockHint')}</p>
            </div>
          </div>
          <input 
            type="datetime-local" 
            className="mobile-datetime-input" 
            value={untilLocal} 
            onChange={(e) => setUntilLocal(e.target.value)} 
            disabled={isSaving}
          />
          {error && <div className="mobile-error">{error}</div>}
        </div>
      )}

      <div className="mobile-preview">
        <div className="preview-icon">{locked ? '⛔' : '✓'}</div>
        <p>
          {locked ? t('availabilityLock.previewLocked') : t('availabilityLock.previewOpen')}
        </p>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel} disabled={isSaving}>{t('common.cancel')}</button>
        <button 
          className="mobile-btn save" 
          onClick={handleSave} 
          disabled={isSaving || !!error}
        >
          {isSaving ? t('workingHours.saving') : t('workingHours.saveChanges')}
        </button>
      </div>
    </div>
  );
}

export default AvailabilityLockEditorMobile;
