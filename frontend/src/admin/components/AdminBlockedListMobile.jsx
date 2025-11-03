import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';


function AdminBlockedListMobile({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [working, setWorking] = useState(false);

  const fetchBlocked = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/blocked`);
      const json = await res.json();
      if (json.success) setItems(json.data || []);
      else setError(json.error || 'Failed to load blocked entries');
    } catch (e) {
      setError('Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchBlocked();
    else {
      setItems([]);
      setSelectedIds(new Set());
    }
  }, [isOpen]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleBulkRemove = async () => {
    if (selectedIds.size === 0) return;
    setWorking(true);
    setError('');
    for (const bid of selectedIds) {
      try {
        const res = await authenticatedFetch(`${API}/blocked/${bid}`, { method: 'DELETE' });
        const json = await res.json();
        if (!json.success) setError(json.error || 'Failed to remove');
      } catch (e) {
        setError('Failed to remove');
      }
    }
    await fetchBlocked();
    setSelectedIds(new Set());
    setWorking(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🚫 Blocked Users & IPs"
      maxWidth="95vw"
      maxHeight="85vh"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '70vh', gap: '1rem' }}>
        {(loading || error) && (
          <div style={{ flexShrink: 0 }}>
            {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">Loading blocked entries…</span></div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((row) => (
            <div key={row.bid} style={{
              background: selectedIds.has(row.bid) 
                ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' 
                : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: selectedIds.has(row.bid) ? '2px solid var(--primary-color)' : '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '1rem',
              boxShadow: selectedIds.has(row.bid) 
                ? '0 4px 12px rgba(102,126,234,0.2)' 
                : '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#999' }}>
                  ID: {row.bid}
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedIds.has(row.bid)}
                  onChange={() => toggleSelect(row.bid)}
                  style={{ 
                    cursor: 'pointer', 
                    width: '20px', 
                    height: '20px',
                    accentColor: 'var(--primary-color)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 600 }}>
                  ✉️ {row.email || '—'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  🌐 IP: {row.ipAddress || '—'}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.75rem 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  📝 Reason: {row.reason || '—'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999' }}>
                  📅 Added: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>No blocked entries</div>
          )}
        </div>

        <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
          <button 
            onClick={handleBulkRemove}
            disabled={selectedIds.size === 0 || working}
            style={{ 
              flex: 1,
              padding: '0.75rem',
              background: selectedIds.size === 0 || working ? '#ccc' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedIds.size === 0 || working ? 'not-allowed' : 'pointer',
              fontWeight: 600
            }}
          >
            🗑️ Remove
          </button>
          <button 
            onClick={onClose}
            style={{ 
              flex: 1,
              padding: '0.75rem',
              background: '#95a5a6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default AdminBlockedListMobile;
