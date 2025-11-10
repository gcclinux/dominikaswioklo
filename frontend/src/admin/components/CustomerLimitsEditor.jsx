import { useState } from 'react';
import './NumberSettingEditor.css';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function CustomerLimitsEditor({ maxApp, maxAppWeek, onSave, onCancel }) {
  const { t } = useAdminTranslation();
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
    <div style={{ padding: '1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      {/* Current Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(118,75,162,0.1) 100%)',
        border: '2px solid var(--primary-border)',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '2rem' }}>📊</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 600, marginBottom: '0.25rem' }}>{t('customerLimits.currentLimits')}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>
            {maxApp} {t('customerLimits.perDay')} · {maxAppWeek} {t('customerLimits.perWeek')}
          </div>
        </div>
      </div>

      {/* Side-by-side Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Daily Limit Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📅</div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>{t('customerLimits.dailyLimit')}</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#7f8c8d' }}>{t('customerLimits.perCustomerPerDay')}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <button 
              onClick={() => setDailyLimit(Math.max(1, dailyLimit - 1))} 
              disabled={isSaving || dailyLimit <= 1}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: '2px solid var(--primary-color)',
                background: isSaving || dailyLimit <= 1 ? '#f0f0f0' : 'white',
                color: isSaving || dailyLimit <= 1 ? '#ccc' : 'var(--primary-color)',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: isSaving || dailyLimit <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              −
            </button>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--primary-color)',
              minWidth: '80px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, var(--primary-light) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '12px',
              padding: '0.5rem'
            }}>
              {dailyLimit}
            </div>
            <button 
              onClick={() => setDailyLimit(Math.min(10, dailyLimit + 1))} 
              disabled={isSaving || dailyLimit >= 10}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: '2px solid var(--primary-color)',
                background: isSaving || dailyLimit >= 10 ? '#f0f0f0' : 'white',
                color: isSaving || dailyLimit >= 10 ? '#ccc' : 'var(--primary-color)',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: isSaving || dailyLimit >= 10 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#27ae60',
            fontWeight: 600,
            background: 'rgba(46,204,113,0.1)',
            padding: '0.5rem',
            borderRadius: '8px'
          }}>
            ✓ {t('customerLimits.recommended')}: 1-2
          </div>
        </div>

        {/* Weekly Limit Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>{t('customerLimits.weeklyLimit')}</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#7f8c8d' }}>{t('customerLimits.perCustomerPerWeek')}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <button 
              onClick={() => setWeeklyLimit(Math.max(1, weeklyLimit - 1))} 
              disabled={isSaving || weeklyLimit <= 1}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: '2px solid var(--secondary-color)',
                background: isSaving || weeklyLimit <= 1 ? '#f0f0f0' : 'white',
                color: isSaving || weeklyLimit <= 1 ? '#ccc' : 'var(--secondary-color)',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: isSaving || weeklyLimit <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              −
            </button>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--secondary-color)',
              minWidth: '80px',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(118,75,162,0.1) 0%, var(--primary-light) 100%)',
              borderRadius: '12px',
              padding: '0.5rem'
            }}>
              {weeklyLimit}
            </div>
            <button 
              onClick={() => setWeeklyLimit(Math.min(20, weeklyLimit + 1))} 
              disabled={isSaving || weeklyLimit >= 20}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                border: '2px solid var(--secondary-color)',
                background: isSaving || weeklyLimit >= 20 ? '#f0f0f0' : 'white',
                color: isSaving || weeklyLimit >= 20 ? '#ccc' : 'var(--secondary-color)',
                fontSize: '1.5rem',
                fontWeight: 700,
                cursor: isSaving || weeklyLimit >= 20 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              +
            </button>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#27ae60',
            fontWeight: 600,
            background: 'rgba(46,204,113,0.1)',
            padding: '0.5rem',
            borderRadius: '8px'
          }}>
            ✓ {t('customerLimits.recommended')}: 3-5
          </div>
        </div>
      </div>

      {/* Preview Box */}
      <div style={{
        background: 'var(--primary-gradient)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        color: 'white',
        boxShadow: '0 6px 20px var(--primary-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>✓</div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.9, marginBottom: '0.25rem' }}>{t('workingHours.preview')}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>
              {t('customerLimits.previewText', { dailyLimit, dailyPlural: dailyLimit !== 1 ? 's' : '', weeklyLimit, weeklyPlural: weeklyLimit !== 1 ? 's' : '' })}
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
          disabled={!hasChanged || isSaving}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: !hasChanged || isSaving ? '#ccc' : 'var(--primary-gradient)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: !hasChanged || isSaving ? 'not-allowed' : 'pointer',
            boxShadow: !hasChanged || isSaving ? 'none' : '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          {isSaving ? `⏳ ${t('workingHours.saving')}` : `✓ ${t('workingHours.saveChanges')}`}
        </button>
      </div>
    </div>
  );
}

export default CustomerLimitsEditor;
