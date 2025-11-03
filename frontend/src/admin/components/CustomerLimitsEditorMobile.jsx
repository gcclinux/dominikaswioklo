import { useState } from 'react';
import './CustomerLimitsEditorMobile.css';

function CustomerLimitsEditorMobile({ maxApp, maxAppWeek, onSave, onCancel }) {
  const [dailyLimit, setDailyLimit] = useState(maxApp);
  const [weeklyLimit, setWeeklyLimit] = useState(maxAppWeek);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ maxApp: dailyLimit, maxAppWeek: weeklyLimit });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = dailyLimit !== maxApp || weeklyLimit !== maxAppWeek;

  return (
    <div className="mobile-limits-editor">
      <div className="mobile-limit-card">
        <div className="card-icon">📅</div>
        <div className="card-header">
          <h3>Daily Limit</h3>
          <p>Per customer, per day</p>
        </div>
        <div className="card-controls">
          <button 
            className="mobile-stepper minus" 
            onClick={() => setDailyLimit(Math.max(1, dailyLimit - 1))} 
            disabled={isSaving || dailyLimit <= 1}
          >
            −
          </button>
          <div className="mobile-value">{dailyLimit}</div>
          <button 
            className="mobile-stepper plus" 
            onClick={() => setDailyLimit(Math.min(10, dailyLimit + 1))} 
            disabled={isSaving || dailyLimit >= 10}
          >
            +
          </button>
        </div>
        <div className="card-hint">Recommended: 1-2</div>
      </div>

      <div className="mobile-limit-card">
        <div className="card-icon">📊</div>
        <div className="card-header">
          <h3>Weekly Limit</h3>
          <p>Per customer, per week</p>
        </div>
        <div className="card-controls">
          <button 
            className="mobile-stepper minus" 
            onClick={() => setWeeklyLimit(Math.max(1, weeklyLimit - 1))} 
            disabled={isSaving || weeklyLimit <= 1}
          >
            −
          </button>
          <div className="mobile-value">{weeklyLimit}</div>
          <button 
            className="mobile-stepper plus" 
            onClick={() => setWeeklyLimit(Math.min(20, weeklyLimit + 1))} 
            disabled={isSaving || weeklyLimit >= 20}
          >
            +
          </button>
        </div>
        <div className="card-hint">Recommended: 3-5</div>
      </div>

      <div className="mobile-preview">
        <div className="preview-icon">✓</div>
        <p>
          Customers can book <strong>{dailyLimit}</strong> per day and <strong>{weeklyLimit}</strong> per week
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

export default CustomerLimitsEditorMobile;
