import { useState, useEffect } from 'react';
import './WorkingHoursEditorMobile.css';

function WorkingHoursEditorMobile({ startHour, endHour, includeWeekend: includeWeekendProp = 1, allow30Min: allow30MinProp = 1, onSave, onCancel }) {
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
    if (s >= e) { setError('Start must be before end'); return false; }
    if (s < 0 || s > 23 || e < 1 || e > 24) { setError('Invalid hours'); return false; }
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
    <div className="mobile-hours-editor">
      <div className="mobile-hours-card">
        <div className="hours-icon">🕐</div>
        <div className="hours-header">
          <h3>Business Hours</h3>
          <p>24-hour format</p>
        </div>
        
        <div className="hours-row">
          <div className="hour-control">
            <label>Start</label>
            <div className="hour-stepper">
              <button onClick={() => setStart(Math.max(0, start - 1))} disabled={isSaving || start <= 0}>−</button>
              <div className="hour-value">{String(start).padStart(2, '0')}:00</div>
              <button onClick={() => setStart(Math.min(23, start + 1))} disabled={isSaving || start >= 23}>+</button>
            </div>
          </div>
          
          <div className="hour-control">
            <label>End</label>
            <div className="hour-stepper">
              <button onClick={() => setEnd(Math.max(1, end - 1))} disabled={isSaving || end <= 1}>−</button>
              <div className="hour-value">{String(end).padStart(2, '0')}:00</div>
              <button onClick={() => setEnd(Math.min(24, end + 1))} disabled={isSaving || end >= 24}>+</button>
            </div>
          </div>
        </div>

        {error && <div className="mobile-error">{error}</div>}
      </div>

      <div className="mobile-options-card">
        <div className="option-toggle" onClick={() => !isSaving && setIncludeWeekend(!includeWeekend)}>
          <div className="option-info">
            <div className="option-icon">📅</div>
            <div>
              <h4>Include Weekends</h4>
              <p>Saturday & Sunday</p>
            </div>
          </div>
          <div className={`toggle-switch ${includeWeekend ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
        </div>

        <div className="option-toggle" onClick={() => !isSaving && setAllow30Min(!allow30Min)}>
          <div className="option-info">
            <div className="option-icon">⏱️</div>
            <div>
              <h4>30-Minute Slots</h4>
              <p>Allow shorter bookings</p>
            </div>
          </div>
          <div className={`toggle-switch ${allow30Min ? 'active' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
        </div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          <strong>{start}:00 - {end}:00</strong><br/>
          {includeWeekend ? 'Weekends included' : 'Weekends off'} · {allow30Min ? '30 or 60 min' : '60 min only'}
        </p>
      </div>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button className="mobile-btn save" onClick={handleSave} disabled={!hasChanged || !!error || isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

export default WorkingHoursEditorMobile;
