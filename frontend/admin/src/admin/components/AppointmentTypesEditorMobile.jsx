import { useState } from 'react';
import './AppointmentTypesEditorMobile.css';

const AppointmentTypesEditorMobile = ({ appointmentTypes = [], currency = 'USD', onSave, onCancel }) => {
  const [types, setTypes] = useState(appointmentTypes.length > 0 ? appointmentTypes.map(t => ({ name: t.appName || t.name || '', tag: t.appTag || t.tag || '', price: t.appPrice || t.price || '' })) : [{ name: '', tag: '', price: '' }]);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);

  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'PLN', symbol: 'zł' },
    { code: 'BRL', symbol: 'R$' },
    { code: 'JPY', symbol: '¥' },
    { code: 'CAD', symbol: 'C$' },
    { code: 'AUD', symbol: 'A$' },
    { code: 'CHF', symbol: 'CHF' },
    { code: 'CNY', symbol: '¥' },
  ];

  const handleAdd = () => setTypes([...types, { name: '', tag: '', price: '' }]);
  const handleRemove = (index) => { if (types.length > 1) setTypes(types.filter((_, i) => i !== index)); };
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
    <div className="mobile-types-editor">
      <div className="mobile-currency-card">
        <div className="currency-icon">{currencies.find(c => c.code === selectedCurrency)?.symbol || '$'}</div>
        <div className="currency-header">
          <h3>Currency</h3>
          <p>For all appointments</p>
        </div>
        <select
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="mobile-currency-select"
        >
          {currencies.map(curr => (
            <option key={curr.code} value={curr.code}>
              {curr.code} ({curr.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="mobile-types-list">
        {types.map((type, index) => (
          <div key={index} className="mobile-type-card">
            <div className="type-card-header">
              <span className="type-number">#{index + 1}</span>
            </div>
            <input
              type="text"
              placeholder="Name (e.g., Consultation)"
              value={type.name}
              onChange={(e) => handleChange(index, 'name', e.target.value)}
              className="mobile-type-input"
            />
            <input
              type="text"
              placeholder="Tag (e.g., consultation)"
              value={type.tag}
              onChange={(e) => handleChange(index, 'tag', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="mobile-type-input"
            />
            <div className="mobile-price-input">
              <span className="price-symbol">{currencies.find(c => c.code === selectedCurrency)?.symbol || '$'}</span>
              <input
                type="number"
                placeholder="0.00"
                value={type.price}
                onChange={(e) => handleChange(index, 'price', e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            {types.length > 1 && (
              <button onClick={() => handleRemove(index)} className="type-remove-bottom">Delete</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleAdd} className="mobile-add-btn">
        + Add Appointment Type
      </button>

      <div className="mobile-actions">
        <button className="mobile-btn cancel" onClick={onCancel}>Cancel</button>
        <button className="mobile-btn save" onClick={handleSave}>Save Changes</button>
      </div>
    </div>
  );
};

export default AppointmentTypesEditorMobile;
