import React, { useState, useEffect } from 'react';
import './NumberSettingEditor.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function WorkingHoursEditor({ startHour, endHour, includeWeekend: includeWeekendProp = 1, allow30Min: allow30MinProp = 1, onSave, onCancel }) {
  const { t } = useAdminTranslation();
  const [start, setStart] = useState(startHour ?? 9);
  const [end, setEnd] = useState(endHour ?? 17);
  const [includeWeekend, setIncludeWeekend] = useState(Boolean(includeWeekendProp));
  const [allow30Min, setAllow30Min] = useState(Boolean(allow30MinProp));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStart(startHour ?? 9);
    setEnd(endHour ?? 17);
    setIncludeWeekend(Boolean(includeWeekendProp));
    setAllow30Min(Boolean(allow30MinProp));
  }, [startHour, endHour, includeWeekendProp, allow30MinProp]);

  const validate = (s, e) => {
    if (s >= e) { setError(t('workingHours.errors.startBeforeEnd')); return false; }
    if (s < 0 || s > 23 || e < 1 || e > 24) { setError(t('workingHours.errors.invalidRange')); return false; }
    setError(''); return true;
  };

  const handleSave = async () => {
    if (!validate(start, end)) return;
    setIsSaving(true);
    try {
      await onSave({
        startHour: start,
        endHour: end,
        includeWeekend: includeWeekend ? 1 : 0,
        allow30Min: allow30Min ? 1 : 0,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = (
    start !== (startHour ?? 9) ||
    end !== (endHour ?? 17) ||
    Boolean(includeWeekendProp) !== includeWeekend ||
    Boolean(allow30MinProp) !== allow30Min
  );

  return (
    <div style={{ padding: '1rem', maxWidth: '650px', margin: '0 auto' }}>
      {/* Current Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(118,75,162,0.1) 100%)',
        border: '2px solid var(--primary-border)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>🕐</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>{t('workingHours.currentSchedule')}</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2c3e50' }}>
            {(startHour ?? 9)}:00 - {(endHour ?? 17)}:00 · {Boolean(includeWeekendProp) ? t('workingHours.weekendsOn') : t('workingHours.weekendsOff')}
          </div>
        </div>
      </div>

      {/* Centered Time Controls */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
          {/* Start Time */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🌅</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem' }}>{t('workingHours.start')}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setStart((s) => Math.max(0, s - 1))} 
                disabled={isSaving || start <= 0}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '2px solid var(--primary-color)',
                  background: isSaving || start <= 0 ? '#f0f0f0' : 'white',
                  color: isSaving || start <= 0 ? '#ccc' : 'var(--primary-color)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: isSaving || start <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                −
              </button>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--primary-color)',
                minWidth: '70px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(118,75,162,0.1) 100%)',
                borderRadius: '8px',
                padding: '0.25rem'
              }}>
                {String(start).padStart(2, '0')}:00
              </div>
              <button 
                onClick={() => setStart((s) => Math.min(23, s + 1))} 
                disabled={isSaving || start >= 23}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '2px solid var(--primary-color)',
                  background: isSaving || start >= 23 ? '#f0f0f0' : 'white',
                  color: isSaving || start >= 23 ? '#ccc' : 'var(--primary-color)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: isSaving || start >= 23 ? 'not-allowed' : 'pointer'
                }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ fontSize: '1.5rem', color: '#ccc' }}>→</div>

          {/* End Time */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🌆</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem' }}>{t('workingHours.end')}</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setEnd((e) => Math.max(1, e - 1))} 
                disabled={isSaving || end <= 1}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '2px solid var(--secondary-color)',
                  background: isSaving || end <= 1 ? '#f0f0f0' : 'white',
                  color: isSaving || end <= 1 ? '#ccc' : 'var(--secondary-color)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: isSaving || end <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                −
              </button>
              <div style={{
                fontSize: '1.8rem',
                fontWeight: 700,
                color: 'var(--secondary-color)',
                minWidth: '70px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(118,75,162,0.1) 0%, var(--primary-light) 100%)',
                borderRadius: '8px',
                padding: '0.25rem'
              }}>
                {String(end).padStart(2, '0')}:00
              </div>
              <button 
                onClick={() => setEnd((e) => Math.min(24, e + 1))} 
                disabled={isSaving || end >= 24}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '2px solid var(--secondary-color)',
                  background: isSaving || end >= 24 ? '#f0f0f0' : 'white',
                  color: isSaving || end >= 24 ? '#ccc' : 'var(--secondary-color)',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  cursor: isSaving || end >= 24 ? 'not-allowed' : 'pointer'
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(231,76,60,0.1)',
          border: '2px solid rgba(231,76,60,0.3)',
          borderRadius: '8px',
          padding: '0.75rem',
          marginBottom: '1rem',
          color: '#c0392b',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Options Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <label style={{
          background: includeWeekend ? 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(39,174,96,0.15) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: includeWeekend ? '2px solid #27ae60' : '2px solid #e0e0e0',
          borderRadius: '10px',
          padding: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <input
            type="checkbox"
            checked={includeWeekend}
            onChange={(e) => setIncludeWeekend(e.target.checked)}
            disabled={isSaving}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#27ae60' }}
          />
          <div>
            <div style={{ fontSize: '1.2rem' }}>📅</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2c3e50' }}>{t('workingHours.weekends')}</div>
          </div>
        </label>

        <label style={{
          background: allow30Min ? 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(39,174,96,0.15) 100%)' : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: allow30Min ? '2px solid #27ae60' : '2px solid #e0e0e0',
          borderRadius: '10px',
          padding: '0.75rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <input
            type="checkbox"
            checked={allow30Min}
            onChange={(e) => setAllow30Min(e.target.checked)}
            disabled={isSaving}
            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#27ae60' }}
          />
          <div>
            <div style={{ fontSize: '1.2rem' }}>⏱️</div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#2c3e50' }}>{t('workingHours.halfHourSlots')}</div>
          </div>
        </label>
      </div>

      {/* Preview Box */}
      <div style={{
        background: 'var(--primary-gradient)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        color: 'white',
        boxShadow: '0 4px 12px var(--primary-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem' }}>✓</div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>{t('workingHours.preview')}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {String(start).padStart(2, '0')}:00 - {String(end).padStart(2, '0')}:00 · {includeWeekend ? t('workingHours.weekends') : t('workingHours.noWeekends')} · {allow30Min ? t('workingHours.slots3060') : t('workingHours.slots60')}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button 
          onClick={onCancel} 
          disabled={isSaving}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: '2px solid #ddd',
            background: 'white',
            color: '#666',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {t('common.cancel')}
        </button>
        <button 
          onClick={handleSave} 
          disabled={!hasChanged || !!error || isSaving}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: !hasChanged || !!error || isSaving ? '#ccc' : 'var(--primary-gradient)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: !hasChanged || !!error || isSaving ? 'not-allowed' : 'pointer',
            boxShadow: !hasChanged || !!error || isSaving ? 'none' : '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSaving ? `⏳ ${t('workingHours.saving')}` : `✓ ${t('workingHours.saveChanges')}`}
        </button>
      </div>
    </div>
  );
}

export default WorkingHoursEditor;
