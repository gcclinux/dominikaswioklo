import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { authenticatedFetch } from '../utils/apiHelper';
import AdminUsersListMobile from './AdminUsersListMobile';
import { API } from '../../config/api';

function AdminUsersList({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [selectedUid, setSelectedUid] = useState(null);
  const [working, setWorking] = useState(false);
  const [isMobile] = useState(window.innerWidth <= 768);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', middle: '', surname: '', email: '', phone: '' });

  const fetchUsers = async () => {
    setLoading(true); setError('');
    try {
      const res = await authenticatedFetch(`${API}/users`);
      const json = await res.json();
      if (json.success) setItems(json.data || []);
      else setError(json.error || 'Failed to load users');
    } catch (e) { setError('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { if (isOpen) fetchUsers(); else { setItems([]); setSelectedUid(null); } }, [isOpen]);

  const doDelete = async (uid = selectedUid) => {
    if (!uid) return setError('Select a user first');
    setWorking(true); setError('');
    try {
      const res = await authenticatedFetch(`${API}/users/${uid}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchUsers();
        setSelectedUid(null);
      } else setError(json.error || 'Failed to delete');
    } catch (e) { setError('Failed to delete'); }
    setWorking(false);
  };

  const doBlock = async (uid = selectedUid) => {
    if (!uid) return setError('Select a user first');
    setWorking(true); setError('');
    try {
      const res = await authenticatedFetch(`${API}/blocked`, {
        method: 'POST',
        body: JSON.stringify({ userId: uid, reason: 'Blocked by admin' })
      });
      const json = await res.json();
      if (json.success) {
        await fetchUsers();
        setSelectedUid(null);
      } else setError(json.error || 'Failed to block');
    } catch (e) { setError('Failed to block'); }
    setWorking(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      middle: user.middle || '',
      surname: user.surname || '',
      email: user.email || '',
      phone: user.phone || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setWorking(true); setError('');
    try {
      const res = await authenticatedFetch(`${API}/users/${editingUser.uid}`, {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      const json = await res.json();
      if (json.success) {
        await fetchUsers();
        setEditingUser(null);
      } else setError(json.error || 'Failed to update user');
    } catch (e) { setError('Failed to update user'); }
    setWorking(false);
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="👥 User List" maxWidth="90vw" maxHeight="80vh">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '60vh', // Fixed height for the entire content
        gap: '1rem'
      }}>
        {/* Fixed header section for loading/error messages */}
        {(loading || error) && (
          <div style={{ flexShrink: 0 }}>
            {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">Loading users…</span></div>}
            {error && <div className="error-message">{error}</div>}
          </div>
        )}

        {isMobile ? (
          <AdminUsersListMobile 
            items={items}
            doDelete={doDelete}
            doBlock={doBlock}
            working={working}
            onEdit={handleEdit}
          />
        ) : (
        <div style={{
          flex: 1,
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 12,
          overflow: 'hidden', // Hide overflow on container
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Fixed table header */}
          <div style={{
            flexShrink: 0,
            background: 'rgba(102,126,234,0.08)',
            borderBottom: '1px solid rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr 0.5fr 0.5fr',
              gap: '0.5rem',
              padding: '0.75rem'
            }}>
              <div style={{ fontWeight: 600 }}>Name</div>
              <div style={{ fontWeight: 600 }}>Email</div>
              <div style={{ fontWeight: 600 }}>Phone</div>
              <div style={{ fontWeight: 600 }}>Created</div>
              <div style={{ fontWeight: 600 }}>Blocked</div>
              <div style={{ fontWeight: 600, textAlign: 'center' }}>Select</div>
              <div style={{ fontWeight: 600, textAlign: 'center' }}>Edit</div>
            </div>
          </div>

          {/* Scrollable user list body - ONLY this section scrolls */}
          <div style={{
            flex: 1,
            overflow: 'auto', // Only the user list scrolls
            background: 'white'
          }}>
            {items.map((row, idx) => (
              <div
                key={row.uid}
                onClick={() => setSelectedUid(prev => prev === row.uid ? null : row.uid)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.5fr 2fr 1fr 0.5fr 0.5fr',
                  gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  borderBottom: '1px solid #eee',
                  background: selectedUid === row.uid ? 'linear-gradient(90deg, rgba(74,144,226,0.12), rgba(74,144,226,0.06))' : idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                  cursor: 'pointer',
                  fontWeight: selectedUid === row.uid ? 600 : 400,
                  borderLeft: selectedUid === row.uid ? '4px solid rgba(74,144,226,0.9)' : '4px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1em' }}>👤</span>
                  <span style={{ fontWeight: 600, fontSize: '1.05em' }}>{row.name} {row.surname || ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>✉️</span>
                  <span>{row.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📞</span>
                  <span>{row.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📅</span>
                  <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</span>
                </div>
                <div>{row.blocked ? 'Yes' : 'No'}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedUid === row.uid}
                    onChange={() => setSelectedUid(prev => prev === row.uid ? null : row.uid)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleEdit(row)}
                    className="nav-button"
                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.85em' }}
                  >
                    ✏️
                  </button>
                </div>
              </div>
            ))}
            {!loading && items.length === 0 && (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#7f8c8d',
                fontStyle: 'italic'
              }}>
                No users found
              </div>
            )}
          </div>
        </div>
        )}

        {!isMobile && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(0,0,0,0.08)',
          background: 'white'
        }}>
          <button className="nav-button" disabled={!selectedUid || working} onClick={() => handleEdit(items.find(u => u.uid === selectedUid))}>✏️ Edit selected user</button>
          <button className="nav-button" disabled={!selectedUid || working} onClick={doDelete}>Delete selected user</button>
          <button className="nav-button" disabled={!selectedUid || working} onClick={doBlock}>Block selected user</button>
          <button className="nav-button" onClick={onClose}>Close</button>
        </div>
        )}
      </div>
    </Modal>

    {/* Edit User Modal */}
    <Modal
      isOpen={!!editingUser}
      onClose={() => setEditingUser(null)}
      title="✏️ Edit User"
      maxWidth="500px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>First Name:</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Middle Name:</label>
          <input
            type="text"
            value={editForm.middle}
            onChange={(e) => setEditForm({ ...editForm, middle: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Last Name:</label>
          <input
            type="text"
            value={editForm.surname}
            onChange={(e) => setEditForm({ ...editForm, surname: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email:</label>
          <input
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone:</label>
          <input
            type="tel"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="cancel-button" onClick={() => setEditingUser(null)}>Cancel</button>
          <button className="nav-button" onClick={handleSaveEdit} disabled={working}>
            {working ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}

export default AdminUsersList;
