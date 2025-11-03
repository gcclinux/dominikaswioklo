import React, { useState } from 'react';
import Modal from './Modal';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';


function PremiumUpgradeModal({ isOpen, onClose, onSuccess }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    licenseKey: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.licenseKey) {
      return setError('All fields are required');
    }

    setWorking(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await authenticatedFetch(`${API}/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      
      if (json.success) {
        setSuccess('Premium license activated! Please restart the server.');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 3000);
      } else {
        setError(json.error || 'Failed to activate license');
      }
    } catch (e) {
      setError('Failed to activate license');
    }
    
    setWorking(false);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', licenseKey: '' });
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🔓 Upgrade to Premium"
      maxWidth="500px"
      closeOnOverlayClick={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
          borderRadius: '8px',
          border: '1px solid rgba(102,126,234,0.3)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#667eea' }}>Premium Features</h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#555' }}>
            <li>Remove all branding</li>
            <li>Email notifications enabled</li>
            <li>Priority support</li>
            <li>Lifetime updates</li>
          </ul>
        </div>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c33',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '0.75rem',
            background: '#efe',
            border: '1px solid #cfc',
            borderRadius: '6px',
            color: '#3c3',
            fontSize: '0.9rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter your name"
              disabled={working || success}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter your email"
              disabled={working || success}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
              License Key *
            </label>
            <input
              type="text"
              value={formData.licenseKey}
              onChange={(e) => setFormData(prev => ({ ...prev, licenseKey: e.target.value.toUpperCase() }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
              placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              disabled={working || success}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
              Enter the license key you received after purchase
            </small>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={working}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="nav-button"
              disabled={working || success}
              style={{
                background: success ? '#27ae60' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            >
              {working ? 'Activating...' : success ? 'Activated!' : 'Activate License'}
            </button>
          </div>
        </form>

        <div style={{
          padding: '0.75rem',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#666',
          textAlign: 'center'
        }}>
          Don't have a license? <a href="https://gumroad.com/your-product" target="_blank" rel="noopener noreferrer" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 500 }}>Purchase Premium</a>
        </div>
      </div>
    </Modal>
  );
}

export default PremiumUpgradeModal;
