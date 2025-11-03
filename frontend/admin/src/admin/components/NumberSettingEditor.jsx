import React, { useState, useEffect } from 'react';
import './NumberSettingEditor.css';

function NumberSettingEditor({ currentValue, onSave, onCancel, min = 1, max = 100, step = 1, label, helpText, recommendedRange, previewText }) {
  const [value, setValue] = useState(currentValue);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { setValue(currentValue); }, [currentValue]);

  const handleIncrement = () => { const newValue = Math.min(value + step, max); setValue(newValue); validateValue(newValue); };
  const handleDecrement = () => { const newValue = Math.max(value - step, min); setValue(newValue); validateValue(newValue); };
  const handleInputChange = (e) => { const newValue = parseInt(e.target.value, 10); if (!isNaN(newValue)) { setValue(newValue); validateValue(newValue); } };

  const validateValue = (val) => { if (val < min) { setError(`Value must be at least ${min}`); return false; } if (val > max) { setError(`Value cannot exceed ${max}`); return false; } setError(''); return true; };

  const handleSave = async () => { if (!validateValue(value)) return; setIsSaving(true); try { await onSave(value); } finally { setIsSaving(false); } };

  const hasChanged = value !== currentValue;

  return (
    <div style={{ padding: '1rem', maxWidth: '550px', margin: '0 auto' }}>
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
        <div style={{ fontSize: '1.5rem' }}>📊</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>CURRENT VALUE</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2c3e50' }}>
            {currentValue} {label && `· ${label}`}
          </div>
        </div>
      </div>

      {/* Centered Value Control */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7f8c8d', marginBottom: '1rem' }}>{label || 'New Value'}</div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center' }}>
            <button 
              onClick={handleDecrement}
              disabled={value <= min || isSaving}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '2px solid #667eea',
                background: value <= min || isSaving ? '#f0f0f0' : 'white',
                color: value <= min || isSaving ? '#ccc' : '#667eea',
                fontSize: '1.3rem',
                fontWeight: 700,
                cursor: value <= min || isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              −
            </button>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#667eea',
              minWidth: '100px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '12px',
              padding: '0.5rem'
            }}>
              {value}
            </div>
            <button 
              onClick={handleIncrement}
              disabled={value >= max || isSaving}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: '2px solid #667eea',
                background: value >= max || isSaving ? '#f0f0f0' : 'white',
                color: value >= max || isSaving ? '#ccc' : '#667eea',
                fontSize: '1.3rem',
                fontWeight: 700,
                cursor: value >= max || isSaving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
          </div>
          {recommendedRange && (
            <div style={{
              marginTop: '1rem',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: '#27ae60',
              fontWeight: 600,
              background: 'rgba(46,204,113,0.1)',
              padding: '0.5rem',
              borderRadius: '8px'
            }}>
              ✓ Recommended: {recommendedRange}
            </div>
          )}
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
      {previewText && hasChanged && (
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
                {previewText(value)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <div style={{
          fontSize: '0.85rem',
          color: '#7f8c8d',
          lineHeight: '1.5',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: 'rgba(0,0,0,0.02)',
          borderRadius: '8px'
        }}>
          {helpText}
        </div>
      )}

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

export default NumberSettingEditor;
