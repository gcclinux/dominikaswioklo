import React, { useState, useEffect } from 'react';
import './NumberSettingEditor.css';

function HeaderMessageEditor({ currentValue, onSave, onCancel, maxLength = 300 }) {
  const DEFAULT_HEADER = 'Update default header in settings';
  const [value, setValue] = useState(currentValue || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => setValue(currentValue || ''), [currentValue]);

  const validate = (v) => {
    if (v.length > maxLength) {
      setError(`Message cannot exceed ${maxLength} characters`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate(value)) return;
    setIsSaving(true);
    try {
      await onSave({ headerMessage: value });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = value !== (currentValue || '');
  const charCount = value.length;
  const charPercentage = (charCount / maxLength) * 100;

  return (
    <div style={{ padding: '1rem', maxWidth: '650px', margin: '0 auto' }}>
      {/* Info Banner */}
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
        <div style={{ fontSize: '1.5rem' }}>💬</div>
        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
          This message appears at the top of the booking calendar. Keep it concise and welcoming.
        </div>
      </div>

      {/* Current Message Display */}
      {currentValue && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(46,204,113,0.1) 0%, rgba(39,174,96,0.1) 100%)',
          border: '2px solid rgba(46,204,113,0.3)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600, marginBottom: '0.25rem' }}>CURRENT MESSAGE</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#2c3e50' }}>{currentValue}</div>
        </div>
      )}

      {/* Text Editor Card */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '0.5rem' }}>
          ✏️ Edit Message
        </label>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isSaving}
          placeholder={DEFAULT_HEADER}
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '0.75rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: 500,
            resize: 'vertical',
            fontFamily: 'inherit',
            lineHeight: '1.5'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <div style={{
            fontSize: '0.8rem',
            color: charPercentage > 90 ? '#e74c3c' : charPercentage > 70 ? '#f39c12' : '#27ae60',
            fontWeight: 600
          }}>
            {charCount} / {maxLength} characters
          </div>
          <div style={{
            width: '100px',
            height: '6px',
            background: '#e0e0e0',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(charPercentage, 100)}%`,
              height: '100%',
              background: charPercentage > 90 ? '#e74c3c' : charPercentage > 70 ? '#f39c12' : '#27ae60',
              transition: 'all 0.3s ease'
            }} />
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
          <div style={{ fontSize: '1.5rem' }}>👁️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.9, marginBottom: '0.25rem' }}>PREVIEW</div>
            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
              {value || <em style={{ opacity: 0.7 }}>{DEFAULT_HEADER}</em>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e0e0e0' }}>
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

export default HeaderMessageEditor;
