import React, { useState, useEffect } from 'react';
import './NumberSettingEditor.css';

function toLocalDateTimeString(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AvailabilityLockEditor({ availabilityLocked, availabilityLockedUntil, onSave, onCancel }) {
  const [locked, setLocked] = useState(Boolean(availabilityLocked));
  const [untilLocal, setUntilLocal] = useState(toLocalDateTimeString(availabilityLockedUntil));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setLocked(Boolean(availabilityLocked)); setUntilLocal(toLocalDateTimeString(availabilityLockedUntil)); }, [availabilityLocked, availabilityLockedUntil]);

  const validate = () => {
    const effective = untilLocal;
    if (locked && effective) {
      const chosen = new Date(effective);
      const now = new Date();
      if (isNaN(chosen.getTime())) { setError('Invalid date/time format'); return false; }
      if (chosen <= now) { setError('Lock-until must be in the future'); return false; }
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
    <div style={{ padding: '1rem', maxWidth: '550px', margin: '0 auto' }}>
      {/* Current Status Banner */}
      <div style={{
        background: locked 
          ? 'linear-gradient(135deg, rgba(231,76,60,0.1) 0%, rgba(192,57,43,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(46,204,113,0.1) 0%, rgba(39,174,96,0.1) 100%)',
        border: locked ? '2px solid rgba(231,76,60,0.3)' : '2px solid rgba(46,204,113,0.3)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>{locked ? '🔒' : '🔓'}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>CURRENT STATUS</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2c3e50' }}>
            {locked ? 'Bookings Locked' : 'Bookings Open'}
            {locked && availabilityLockedUntil && ` · Until ${new Date(availabilityLockedUntil).toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* Lock Toggle Card */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '1rem' }}>Lock Availability?</div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => setLocked(true)}
              disabled={isSaving}
              style={{
                flex: 1,
                maxWidth: '120px',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: locked ? '2px solid #e74c3c' : '2px solid #ddd',
                background: locked ? 'linear-gradient(135deg, rgba(231,76,60,0.15) 0%, rgba(192,57,43,0.15) 100%)' : 'white',
                color: locked ? '#c0392b' : '#666',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🔒 Yes
            </button>
            <button 
              onClick={() => setLocked(false)}
              disabled={isSaving}
              style={{
                flex: 1,
                maxWidth: '120px',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                border: !locked ? '2px solid #27ae60' : '2px solid #ddd',
                background: !locked ? 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(39,174,96,0.15) 100%)' : 'white',
                color: !locked ? '#27ae60' : '#666',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🔓 No
            </button>
          </div>
        </div>

        {/* Date/Time Picker */}
        {locked && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem', textAlign: 'center' }}>
              📅 Auto-Unlock Date/Time (Optional)
            </label>
            <input 
              type="datetime-local" 
              value={untilLocal} 
              onChange={(e) => setUntilLocal(e.target.value)} 
              disabled={isSaving}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#2c3e50',
                textAlign: 'center'
              }}
            />
          </div>
        )}
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

      {/* Info Box */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
          <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
            When locked, customers won't be able to book new appointments. Set an optional date/time to automatically unlock later.
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
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          disabled={isSaving || !!error}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: isSaving || !!error ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: isSaving || !!error ? 'not-allowed' : 'pointer',
            boxShadow: isSaving || !!error ? 'none' : '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default AvailabilityLockEditor;
