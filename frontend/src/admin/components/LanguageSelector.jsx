import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Language selector component for admin interface
 * Allows switching between English and Polish
 */
function LanguageSelector({ compact = false }) {
  const { language, toggleLanguage } = useLanguage();

  const handleLanguageChange = (lang) => {
    toggleLanguage(lang);
  };

  if (compact) {
    // Compact version for mobile/header
    return (
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.25rem',
      }}>
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            padding: '0.4rem 0.8rem',
            background: language === 'en' ? 'white' : 'transparent',
            color: language === 'en' ? '#2c3e50' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: language === 'en' ? 600 : 400,
            transition: 'all 0.2s ease',
            boxShadow: language === 'en' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
          title="English"
        >
          EN
        </button>
        <button
          onClick={() => handleLanguageChange('pl')}
          style={{
            padding: '0.4rem 0.8rem',
            background: language === 'pl' ? 'white' : 'transparent',
            color: language === 'pl' ? '#2c3e50' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: language === 'pl' ? 600 : 400,
            transition: 'all 0.2s ease',
            boxShadow: language === 'pl' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
          }}
          title="Polski"
        >
          PL
        </button>
      </div>
    );
  }

  // Full version for settings page
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <label style={{
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#2c3e50',
      }}>
        🌐 Language / Język
      </label>
      <div style={{
        display: 'flex',
        gap: '1rem',
      }}>
        <button
          onClick={() => handleLanguageChange('en')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            background: language === 'en' ? 'var(--primary-gradient)' : 'white',
            color: language === 'en' ? 'white' : '#2c3e50',
            border: language === 'en' ? 'none' : '2px solid #e1e8ed',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: language === 'en' ? 600 : 400,
            transition: 'all 0.2s ease',
            boxShadow: language === 'en' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (language !== 'en') {
              e.target.style.borderColor = '#3498db';
            }
          }}
          onMouseLeave={(e) => {
            if (language !== 'en') {
              e.target.style.borderColor = '#e1e8ed';
            }
          }}
        >
          🇬🇧 English
        </button>
        <button
          onClick={() => handleLanguageChange('pl')}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            background: language === 'pl' ? 'var(--primary-gradient)' : 'white',
            color: language === 'pl' ? 'white' : '#2c3e50',
            border: language === 'pl' ? 'none' : '2px solid #e1e8ed',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: language === 'pl' ? 600 : 400,
            transition: 'all 0.2s ease',
            boxShadow: language === 'pl' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (language !== 'pl') {
              e.target.style.borderColor = '#3498db';
            }
          }}
          onMouseLeave={(e) => {
            if (language !== 'pl') {
              e.target.style.borderColor = '#e1e8ed';
            }
          }}
        >
          🇵🇱 Polski
        </button>
      </div>
    </div>
  );
}

export default LanguageSelector;
