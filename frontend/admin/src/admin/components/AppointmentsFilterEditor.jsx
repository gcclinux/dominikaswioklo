import React, { useState, useEffect } from 'react';
import './NumberSettingEditor.css';

const PRESETS = [7, 14, 30, 90];

function AppointmentsFilterEditor({ pastDays, futureDays, onSave, onCancel }) {
  const [past, setPast] = useState(pastDays ?? 30);
  const [future, setFuture] = useState(futureDays ?? 30);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setPast(pastDays ?? 30); setFuture(futureDays ?? 30); }, [pastDays, futureDays]);

  const validate = (p, f) => {
    if (!PRESETS.includes(p) || !PRESETS.includes(f)) {
      setError('Please choose from 7, 14, 30, or 90 days');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate(past, future)) return;
    setIsSaving(true);
    try {
      await onSave({ pastAppointmentsDays: past, futureAppointmentsDays: future });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = (past !== (pastDays ?? 30)) || (future !== (futureDays ?? 30));

  return (
    <div style={{ padding: '1rem', maxWidth: '650px', margin: '0 auto' }}>
      {/* Current Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        border: '2px solid rgba(102,126,234,0.3)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>📅</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>CURRENT FILTERS</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2c3e50' }}>
            Past: {pastDays ?? 30} days · Future: {futureDays ?? 30} days
          </div>
        </div>
      </div>

      {/* Side-by-side Filter Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* Past Days Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⏪</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d' }}>Past Appointments</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {PRESETS.map(v => (
              <button
                key={`past-${v}`}
                onClick={() => setPast(v)}
                disabled={isSaving}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: past === v ? '2px solid #667eea' : '2px solid #ddd',
                  background: past === v ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' : 'white',
                  color: past === v ? '#667eea' : '#666',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {v}d
              </button>
            ))}
          </div>
        </div>

        {/* Future Days Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⏩</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d' }}>Future Appointments</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {PRESETS.map(v => (
              <button
                key={`future-${v}`}
                onClick={() => setFuture(v)}
                disabled={isSaving}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: future === v ? '2px solid #764ba2' : '2px solid #ddd',
                  background: future === v ? 'linear-gradient(135deg, rgba(118,75,162,0.15) 0%, rgba(102,126,234,0.15) 100%)' : 'white',
                  color: future === v ? '#764ba2' : '#666',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {v}d
              </button>
            ))}
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

      {/* Preview Box */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '10px',
        padding: '1rem',
        marginBottom: '1rem',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102,126,234,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '1.5rem' }}>✓</div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9 }}>PREVIEW</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>
              Show appointments from past <strong>{past}</strong> days and next <strong>{future}</strong> days
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
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          disabled={!hasChanged || !!error || isSaving}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: !hasChanged || !!error || isSaving ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: !hasChanged || !!error || isSaving ? 'not-allowed' : 'pointer',
            boxShadow: !hasChanged || !!error || isSaving ? 'none' : '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSaving ? '⏳ Saving...' : '✓ Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default AppointmentsFilterEditor;