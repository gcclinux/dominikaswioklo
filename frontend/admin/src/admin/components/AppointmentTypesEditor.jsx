import React, { useState } from 'react';

const AppointmentTypesEditor = ({ appointmentTypes = [], currency = 'USD', onSave, onCancel }) => {
  const [types, setTypes] = useState(appointmentTypes.length > 0 ? appointmentTypes.map(t => ({ name: t.appName || t.name || '', tag: t.appTag || t.tag || '', price: t.appPrice || t.price || '' })) : [{ name: '', tag: '', price: '' }]);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const currencies = [
    { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
    { code: 'EUR', name: 'Euro (€)', symbol: '€' },
    { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
    { code: 'PLN', name: 'Polish Złoty (zł)', symbol: 'zł' },
    { code: 'BRL', name: 'Brazilian Real (R$)', symbol: 'R$' },
    { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc (CHF)', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan (¥)', symbol: '¥' },
  ];

  const handleAdd = () => {
    setTypes([...types, { name: '', tag: '', price: '' }]);
  };

  const handleRemove = (index) => {
    if (types.length > 1) {
      setTypes(types.filter((_, i) => i !== index));
    }
  };

  const handleChange = (index, field, value) => {
    const updated = [...types];
    updated[index][field] = value;
    setTypes(updated);
  };

  const handleSave = () => {
    const validTypes = types.filter(t => t.name.trim() !== '');
    onSave({ types: validTypes, currency: selectedCurrency });
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '700px', margin: '0 auto' }}>
      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
        border: '2px solid rgba(102,126,234,0.3)',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>ℹ️</div>
        <div style={{ fontSize: '0.85rem', color: '#666', lineHeight: '1.5' }}>
          Define appointment types with names, tags, and prices for your booking system.
        </div>
      </div>

      {/* Currency Selector Card */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        border: '2px solid #e0e0e0',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '1.5rem' }}>💰</div>
          <label style={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
            Currency
          </label>
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: '2px solid #667eea',
              borderRadius: '8px',
              fontSize: '0.95rem',
              background: 'white',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#2c3e50'
            }}
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointment Types List */}
      <div style={{ marginBottom: '1rem' }}>
        {types.map((type, index) => (
          <div key={index} style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '2px solid #e0e0e0',
            borderRadius: '10px',
            padding: '0.75rem',
            marginBottom: '0.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '1.2rem' }}>📋</div>
            <input
              type="text"
              placeholder="Name (e.g., Consultation)"
              value={type.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              style={{
                flex: '1 1 30%',
                minWidth: 0,
                padding: '0.6rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
            <input
              type="text"
              placeholder="Tag (e.g., consultation)"
              value={type.tag}
              onChange={(e) => handleChange(index, 'tag', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              style={{
                flex: '1 1 30%',
                minWidth: 0,
                padding: '0.6rem',
                border: type.tag.includes(' ') ? '2px solid #e74c3c' : '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            />
            <input
              type="number"
              placeholder="Price"
              value={type.price}
              onChange={(e) => handleChange(index, 'price', e.target.value)}
              step="0.01"
              min="0"
              style={{
                width: '80px',
                flexShrink: 0,
                padding: '0.6rem',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            />
            <button
              onClick={() => handleRemove(index)}
              disabled={types.length === 1}
              style={{
                padding: '0.6rem 0.75rem',
                background: types.length === 1 ? '#ccc' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: types.length === 1 ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add Button */}
      <button
        onClick={handleAdd}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)',
          color: '#667eea',
          border: '2px dashed #667eea',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          fontWeight: 600,
          marginBottom: '1rem',
          transition: 'all 0.2s ease'
        }}
      >
        + Add Appointment Type
      </button>

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
            boxShadow: '0 4px 12px rgba(102,126,234,0.4)',
            transition: 'all 0.2s ease'
          }}
        >
          ✓ Save Changes
        </button>
      </div>
    </div>
  );
};

export default AppointmentTypesEditor;
