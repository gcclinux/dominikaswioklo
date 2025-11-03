import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';


function LicenseDetailsModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(true);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchLicenseInfo();
    }
  }, [isOpen]);

  const fetchLicenseInfo = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch(`${API}/license`);
      const json = await res.json();
      if (json.success) {
        setLicenseInfo(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch license info:', e);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔓 Premium License Details"
      maxWidth="500px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
            Loading license information...
          </div>
        ) : (
          <>
            <div style={{
              padding: '1rem',
              background: licenseInfo?.isPremium && licenseInfo?.isValid 
                ? 'linear-gradient(135deg, rgba(39,174,96,0.1), rgba(46,204,113,0.1))'
                : 'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
              borderRadius: '8px',
              border: licenseInfo?.isPremium && licenseInfo?.isValid
                ? '1px solid rgba(39,174,96,0.3)'
                : '1px solid rgba(102,126,234,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {licenseInfo?.isPremium && licenseInfo?.isValid ? '✅' : '🔒'}
                </span>
                <h3 style={{ margin: 0, color: licenseInfo?.isPremium && licenseInfo?.isValid ? '#27ae60' : '#667eea' }}>
                  {licenseInfo?.isPremium && licenseInfo?.isValid ? 'Premium Active' : 'Free Tier'}
                </h3>
              </div>
              
              {licenseInfo?.isPremium && licenseInfo?.isValid ? (
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Licensed to:</strong> {licenseInfo.name}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>Email:</strong> {licenseInfo.email}
                  </p>
                  <p style={{ margin: '0.5rem 0' }}>
                    <strong>License:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{licenseInfo.licenseKey}</span>
                  </p>
                </div>
              ) : (
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#555' }}>
                  Upgrade to premium to unlock all features
                </p>
              )}
            </div>

            <div style={{
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: '#2c3e50' }}>
                {licenseInfo?.isPremium && licenseInfo?.isValid ? 'Premium Features' : 'Available in Premium'}
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#555' }}>
                <li>Remove all branding</li>
                <li>Email notifications enabled</li>
                <li>Priority support</li>
                <li>Lifetime updates</li>
              </ul>
            </div>

            {(!licenseInfo?.isPremium || !licenseInfo?.isValid) && (
              <div style={{
                padding: '0.75rem',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#856404',
                textAlign: 'center'
              }}>
                Purchase premium for $49 one-time payment
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                className="nav-button"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default LicenseDetailsModal;
