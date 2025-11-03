import React, { useState } from 'react';

function EmailSettingsEditor({ settings, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    smtpHost: settings.smtpHost || 'smtp.gmail.com',
    smtpPort: settings.smtpPort || 587,
    smtpSecure: settings.smtpSecure === 1,
    smtpUser: settings.smtpUser || '',
    smtpPass: settings.smtpPass === '********' ? '' : settings.smtpPass || '',
    smtpFrom: settings.smtpFrom || '',
    emailFooter: settings.emailFooter || 'Scheduler System'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload = { ...formData };
    if (!payload.smtpPass) delete payload.smtpPass;
    onSave(payload);
  };

  return (
    <div style={{ padding: '0.1rem 1rem 1rem 1rem', maxWidth: '750px', margin: '0 auto' }}>
      {/* Info Banner */}
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
        <div style={{ fontSize: '1.5rem' }}>📧</div>
        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
          Configure SMTP settings to enable email notifications for appointments.
        </div>
      </div>

      {/* Side-by-side: SMTP Server & Email Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        {/* SMTP Server Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.2rem' }}>🖥️</div>
            <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>SMTP Server</div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Host</label>
            <input
              type="text"
              value={formData.smtpHost}
              onChange={(e) => handleChange('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}
            />
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Port</label>
            <input
              type="number"
              value={formData.smtpPort}
              onChange={(e) => handleChange('smtpPort', parseInt(e.target.value))}
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Security</label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem',
              border: formData.smtpSecure ? '2px solid #27ae60' : '2px solid #ddd',
              borderRadius: '8px',
              background: formData.smtpSecure ? 'rgba(46,204,113,0.1)' : 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="checkbox"
                checked={formData.smtpSecure}
                onChange={(e) => handleChange('smtpSecure', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#27ae60' }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>SSL/TLS</span>
            </label>
          </div>
        </div>

        {/* Email Settings Card */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '1.2rem' }}>✉️</div>
            <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Email Settings</div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>From Email</label>
            <input
              type="email"
              value={formData.smtpFrom}
              onChange={(e) => handleChange('smtpFrom', e.target.value)}
              placeholder="noreply@yourdomain.com"
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Email Footer</label>
            <input
              type="text"
              value={formData.emailFooter}
              onChange={(e) => handleChange('emailFooter', e.target.value)}
              placeholder="Scheduler System"
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}
            />
            <small style={{ display: 'block', marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.8rem' }}>Appears at the bottom of emails</small>
          </div>
        </div>
      </div>

      {/* Authentication Card - Full Width */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '1.2rem' }}>🔑</div>
          <div style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>Authentication</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Email Address</label>
            <input
              type="email"
              value={formData.smtpUser}
              onChange={(e) => handleChange('smtpUser', e.target.value)}
              placeholder="your-email@gmail.com"
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.85rem', color: '#7f8c8d' }}>Password</label>
            <input
              type="password"
              value={formData.smtpPass}
              onChange={(e) => handleChange('smtpPass', e.target.value)}
              placeholder={settings.smtpPass === '********' ? 'Leave empty to keep current' : 'App password'}
              style={{ width: '100%', padding: '0.6rem', border: '2px solid #ddd', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}
            />
          </div>
        </div>
        <div style={{
          marginTop: '0.75rem',
          padding: '0.5rem',
          background: 'rgba(52,152,219,0.1)',
          borderRadius: '6px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          💡 For Gmail, use App Password from <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', fontWeight: 600 }}>here</a>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '2px solid #e0e0e0' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: '2px solid #ddd',
            background: 'white',
            color: '#666',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--primary-gradient)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          ✓ Save Settings
        </button>
      </div>
    </div>
  );
}

export default EmailSettingsEditor;
