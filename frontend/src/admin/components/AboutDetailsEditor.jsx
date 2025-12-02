import React, { useState, useEffect } from 'react';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';
import { useAdminTranslation } from '../utils/useAdminTranslation';

const SECTION_KEYS = ['header', 'intro', 'approach', 'expertise', 'personal'];

// Initialize sections with empty values
const getInitialSections = () => {
  const initSections = {};
  SECTION_KEYS.forEach(key => {
    initSections[key] = { title: '', body: '' };
  });
  return initSections;
};

const AboutDetailsEditor = ({ onCancel, onSave }) => {
  const { t } = useAdminTranslation();
  const [sections, setSections] = useState(getInitialSections());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch existing sections from API
  useEffect(() => {
    const fetchSections = async () => {
      try {
        // Fetch sections (using 'default' language for universal content)
        const response = await fetch(`${API}/about/default`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const newSections = getInitialSections();
          
          // API returns an object keyed by sectionKey: { header: {title, body}, intro: {title, body}, ... }
          SECTION_KEYS.forEach(sectionKey => {
            if (data.data[sectionKey]) {
              newSections[sectionKey] = {
                title: data.data[sectionKey].title || '',
                body: data.data[sectionKey].body || ''
              };
            }
          });
          
          setSections(newSections);
        }
      } catch (error) {
        console.error('Error fetching about sections:', error);
        showToast(t('aboutDetails.toast.loadFailed'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSectionChange = (sectionKey, field, value) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build array of sections to save (using 'default' as universal language)
      const sectionsToSave = SECTION_KEYS.map(sectionKey => ({
        sectionKey,
        language: 'default',
        title: sections[sectionKey]?.title || '',
        body: sections[sectionKey]?.body || ''
      }));

      const response = await authenticatedFetch(`${API}/about/bulk`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: sectionsToSave })
      });

      const data = await response.json();

      if (data.success) {
        showToast(t('aboutDetails.toast.saved'), 'success');
        if (onSave) onSave();
      } else {
        showToast(t('aboutDetails.toast.failed'), 'error');
      }
    } catch (error) {
      console.error('Error saving about sections:', error);
      showToast(t('aboutDetails.toast.error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          backgroundColor: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          zIndex: 1100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toast.message}
        </div>
      )}

      {/* Help text */}
      <div style={{
        padding: '0.75rem 1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        fontSize: '0.9rem',
        color: '#666',
        borderLeft: '4px solid #3498db'
      }}>
        <span dangerouslySetInnerHTML={{ __html: t('aboutDetails.helpText') }} />
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {SECTION_KEYS.map(sectionKey => (
          <div 
            key={sectionKey}
            style={{
              padding: '1.25rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e0e0e0'
            }}
          >
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              color: '#2c3e50',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ 
                width: '8px', 
                height: '8px', 
                backgroundColor: '#3498db', 
                borderRadius: '50%',
                display: 'inline-block'
              }}></span>
              {t(`aboutDetails.sections.${sectionKey}`)}
            </h3>

            {/* Title field */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 600, 
                color: '#555',
                fontSize: '0.9rem'
              }}>
                {t('aboutDetails.fields.title')}
              </label>
              <input
                type="text"
                value={sections[sectionKey]?.title || ''}
                onChange={(e) => handleSectionChange(sectionKey, 'title', e.target.value)}
                placeholder={t('aboutDetails.placeholders.title')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Body field (textarea) */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 600, 
                color: '#555',
                fontSize: '0.9rem'
              }}>
                {t('aboutDetails.fields.body')}
              </label>
              <textarea
                value={sections[sectionKey]?.body || ''}
                onChange={(e) => handleSectionChange(sectionKey, 'body', e.target.value)}
                placeholder={t('aboutDetails.placeholders.body')}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '2rem',
        paddingTop: '1.5rem',
        borderTop: '1px solid #eee'
      }}>
        <button
          onClick={onCancel}
          style={{
            padding: '0.75rem 1.5rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#666',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: saving ? '#95a5a6' : '#27ae60',
            color: 'white',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {saving ? t('aboutDetails.saving') : t('aboutDetails.saveButton')}
        </button>
      </div>
    </div>
  );
};

export default AboutDetailsEditor;
