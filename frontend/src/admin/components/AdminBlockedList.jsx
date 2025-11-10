import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';
import { useAdminTranslation } from '../utils/useAdminTranslation';
import AdminBlockedListMobile from './AdminBlockedListMobile';


function AdminBlockedList({ isOpen, onClose }) {
  const { t } = useAdminTranslation();
  const [isMobile] = useState(window.innerWidth <= 768);
  
  // If mobile, render mobile component
  if (isMobile) {
    return <AdminBlockedListMobile isOpen={isOpen} onClose={onClose} />;
  }
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [working, setWorking] = useState({});
  const thStyle = { textAlign: 'left', padding: '0.75rem', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' };
  const tdStyle = { padding: '0.6rem', whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'anywhere' };

  const fetchBlocked = async () => {
    setLoading(true); setError('');
    try {
      const res = await authenticatedFetch(`${API}/blocked`);
      const json = await res.json();
      if (json.success) setItems(json.data || []);
      else setError(json.error || t('blocked.loadError'));
    } catch (e) { setError(t('blocked.loadError')); }
    setLoading(false);
  };

  useEffect(() => { if (isOpen) fetchBlocked(); }, [isOpen]);

  const remove = async (bid) => {
    if (!bid) return;
    setWorking(w => ({ ...w, [bid]: true }));
    try {
      const res = await authenticatedFetch(`${API}/blocked/${bid}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) await fetchBlocked();
      else setError(json.error || t('blocked.toast.removeFailed'));
    } catch (e) { setError(t('blocked.toast.removeFailed')); }
    setWorking(w => ({ ...w, [bid]: false }));
  };

  return (
  <Modal isOpen={isOpen} onClose={onClose} title={`🚫 ${t('blocked.title')}`} maxWidth="90vw" maxHeight="80vh">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">{t('blocked.loading')}</span></div>}
        {error && <div className="error-message">{error}</div>}

        <div style={{ overflow: 'auto', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: 'rgba(102,126,234,0.08)' }}>
                <th style={thStyle}>✉️ {t('blocked.table.email')}</th>
                <th style={thStyle}>🌐 {t('blocked.table.ip')}</th>
                <th style={thStyle}>📝 {t('blocked.table.reason')}</th>
                <th style={thStyle}>📅 {t('blocked.table.added')}</th>
                <th style={thStyle}>⚙️ {t('blocked.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => (
                <tr key={row.bid} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>✉️</span>
                      <span>{row.email || '—'}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>🌐</span>
                      <span>{row.ipAddress || '—'}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📝</span>
                      <span>{row.reason || '—'}</span>
                    </div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>📅</span>
                      <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, display: 'flex', gap: '0.5rem' }}>
                    <button className="hover-gradient-button wide-button" disabled={working[row.bid]} onClick={() => remove(row.bid)}>{t('blocked.actions.remove')}</button>
                  </td>
                </tr>
              ))}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d' }}>{t('blocked.noBlocked')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default AdminBlockedList;
