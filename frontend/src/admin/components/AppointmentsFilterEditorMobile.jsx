import { useState, useEffect } from 'react';
import './AppointmentsFilterEditorMobile.css';

const PRESETS = [7, 14, 30, 90];

function AppointmentsFilterEditorMobile({ pastDays, futureDays, onSave, onCancel }) {
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
          <h3>Past Appointments</h3>
          <p>Show appointments from the past...</p>
        </div>
        <div className="filter-presets">
          {PRESETS.map(v => (
            <button
              key={`past-${v}`}
              className={`preset-btn ${past === v ? 'active' : ''}`}
              onClick={() => setPast(v)}
              disabled={isSaving}
            >
              {v} days
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-filter-card">
        <div className="filter-icon">📅</div>
        <div className="filter-header">
          <h3>Future Appointments</h3>
          <p>Show upcoming appointments for...</p>
        </div>
        <div className="filter-presets">
          {PRESETS.map(v => (
            <button
              key={`future-${v}`}
              className={`preset-btn ${future === v ? 'active' : ''}`}
              onClick={() => setFuture(v)}
              disabled={isSaving}
            >
              {v} days
            </button>
          ))}
        </div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          Admin lists will show appointments from the past <strong>{past} days</strong> and upcoming for the next <strong>{future} days</strong>
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

export default AppointmentsFilterEditorMobile;
