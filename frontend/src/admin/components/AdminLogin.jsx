import React, { useState } from 'react';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { useAdminTranslation } from '../utils/useAdminTranslation';

function AdminLogin({ onLoginSuccess }) {
  const { t } = useAdminTranslation();
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.login || !credentials.password) {
      setError(t('login.errors.bothFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const json = await res.json();

      if (json.success) {
        // Store admin data in sessionStorage (cleared when browser closes)
        sessionStorage.setItem('adminSession', JSON.stringify({
          admin: json.data,
          loginTime: new Date().toISOString()
        }));
        onLoginSuccess(json.data);
      } else {
        setError(json.error || t('login.errors.loginFailed'));
      }
    } catch (err) {
      setError(t('login.errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--primary-gradient)',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            margin: 0, 
            color: '#2c3e50', 
            fontSize: '1.8rem',
            fontWeight: 600 
          }}>
            🔐 {t('login.title')}
          </h1>
          <p style={{ 
            margin: '0.5rem 0 0 0', 
            color: '#7f8c8d',
            fontSize: '0.9rem'
          }}>
            {t('login.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem', 
              fontWeight: 500,
              color: '#2c3e50'
            }}>
              <span>👤</span>
              <span>{t('login.loginLabel')}</span>
            </label>
            <input
              type="text"
              value={credentials.login}
              onChange={(e) => handleInputChange('login', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
              placeholder={t('login.placeholder.login')}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem', 
              fontWeight: 500,
              color: '#2c3e50'
            }}>
              <span>🔑</span>
              <span>{t('login.passwordLabel')}</span>
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e1e8ed',
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
              onBlur={(e) => e.target.style.borderColor = '#e1e8ed'}
              placeholder={t('login.placeholder.password')}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '6px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              color: '#c33',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#bdc3c7' : 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              transform: loading ? 'none' : 'translateY(0)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {loading ? (
              <>
                <span style={{ 
                  display: 'inline-block', 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid #fff', 
                  borderTop: '2px solid transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }} />
                {t('login.loggingIn')}
              </>
            ) : (
              t('login.loginButton')
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: '#95a5a6'
        }}>
          {t('footer.version')}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AdminLogin;