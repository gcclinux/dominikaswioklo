import { useState, useEffect } from 'react';
import './DisplayAvailabilityEditorMobile.css';

function DisplayAvailabilityEditorMobile({ currentValue, onSave, onCancel, min = 1, max = 52 }) {
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
          <h3>Weeks Ahead</h3>
          <p>Booking calendar visibility</p>
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
        <div className="availability-hint">Recommended: 1-8 weeks</div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          {value === 1 
            ? 'Customers will see availability for the next week only' 
            : `Customers will see availability for the next ${value} weeks`}
        </p>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel} disabled={isSaving}>
          Cancel
        </button>
        <button 
          className="mobile-btn save" 
          onClick={handleSave} 
          disabled={!hasChanged || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default DisplayAvailabilityEditorMobile;
