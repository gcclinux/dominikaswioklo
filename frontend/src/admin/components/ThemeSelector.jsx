import React, { useState } from 'react';

const ThemeSelector = ({ currentTheme = 'purple', onSave, onCancel }) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  const themes = [
    {
      id: 'purple',
      name: 'Purple Gradient',
      description: 'Modern purple gradient theme (EasyScheduler default)',
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      preview: '#667eea'
    },
    {
      id: 'green',
      name: 'Dark Green',
      description: 'Professional dark green theme (Dominika default)',
      primary: 'linear-gradient(135deg, #2d5016 0%, #1a3d0a 100%)',
      preview: '#2d5016'
    },
    {
      id: 'orange',
      name: 'Orange Gradient',
      description: 'Vibrant orange gradient theme',
      primary: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
      preview: '#e67e22'
    }
  ];

  const handleSave = () => {
    console.log('Saving theme:', selectedTheme);
    onSave({ siteTheme: selectedTheme });
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        border: '2px solid rgba(102,126,234,0.3)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>🎨</div>
        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
          Select a theme for your site. This will update colors across the entire application.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {themes.map((theme) => (
          <div
            key={theme.id}
            onClick={() => setSelectedTheme(theme.id)}
            style={{
              border: selectedTheme === theme.id ? '3px solid #667eea' : '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              background: selectedTheme === theme.id ? 'rgba(102,126,234,0.05)' : 'white',
              transition: 'all 0.2s ease',
              boxShadow: selectedTheme === theme.id ? '0 4px 12px rgba(102,126,234,0.2)' : '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: theme.primary,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#2c3e50', marginBottom: '0.25rem' }}>
                  {theme.name}
                  {selectedTheme === theme.id && (
                    <span style={{ marginLeft: '0.5rem', color: '#667eea', fontSize: '1rem' }}>✓</span>
                  )}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {theme.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)'
          }}
        >
          ✓ Save Theme
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;
