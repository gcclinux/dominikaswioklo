import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';


function AdminAccessMobile({ isOpen, onClose, currentAdmin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [working, setWorking] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    surname: '',
    email: '',
    login: '',
    password: ''
  });

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins`);
      const json = await res.json();
      if (json.success) setItems(json.data || []);
      else setError(json.error || 'Failed to load admin accounts');
    } catch (e) {
      setError('Failed to load admin accounts');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchAdmins();
    else {
      setItems([]);
      setSelectedIds(new Set());
      setShowPasswordModal(false);
      setShowAddModal(false);
      setShowEmailModal(false);
      setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
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

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setWorking(true);
    setError('');
    for (const aid of selectedIds) {
      try {
        const res = await authenticatedFetch(`${API}/admins/${aid}`, { method: 'DELETE' });
        const json = await res.json();
        if (!json.success) setError(json.error || 'Failed to delete admin');
      } catch (e) {
        setError('Failed to delete admin');
      }
    }
    await fetchAdmins();
    setSelectedIds(new Set());
    setWorking(false);
  };

  const doChangePassword = async () => {
    if (!selectedAdmin) return setError('Select an admin first');
    if (!newPassword || !confirmPassword) return setError('Please fill in both password fields');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');

    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedAdmin.aid}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setSelectedAdmin(null);
      } else setError(json.error || 'Failed to change password');
    } catch (e) {
      setError('Failed to change password');
    }
    setWorking(false);
  };

  const doChangeEmail = async () => {
    if (!selectedAdmin) return setError('Select an admin first');

    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedAdmin.aid}`, {
        method: 'PUT',
        body: JSON.stringify({ email: newEmail || null })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setShowEmailModal(false);
        setNewEmail('');
        setSelectedAdmin(null);
      } else setError(json.error || 'Failed to change email');
    } catch (e) {
      setError('Failed to change email');
    }
    setWorking(false);
  };

  const doAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.surname || !newAdmin.email || !newAdmin.login || !newAdmin.password) {
      return setError('All fields are required');
    }
    if (newAdmin.password.length < 6) return setError('Password must be at least 6 characters');

    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins`, {
        method: 'POST',
        body: JSON.stringify({
          aName: newAdmin.name,
          aSurname: newAdmin.surname,
          email: newAdmin.email,
          login: newAdmin.login,
          password: newAdmin.password
        })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setShowAddModal(false);
        setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
      } else setError(json.error || 'Failed to add admin');
    } catch (e) {
      setError('Failed to add admin');
    }
    setWorking(false);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="🔐 Admin Access"
        maxWidth="95vw"
        maxHeight="85vh"
        closeOnOverlayClick={false}
        showCloseButton={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '70vh', gap: '1rem' }}>
          {(loading || error) && (
            <div style={{ flexShrink: 0 }}>
              {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">Loading admin accounts…</span></div>}
              {error && <div className="error-message">{error}</div>}
            </div>
          )}

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((row) => {
              const isCurrentAdmin = currentAdmin && row.aid === currentAdmin.aid;
              return (
                <div key={row.aid} style={{
                  background: selectedIds.has(row.aid) 
                    ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)' 
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: selectedIds.has(row.aid) ? '2px solid var(--primary-color)' : '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '1rem',
                  boxShadow: selectedIds.has(row.aid) 
                    ? '0 4px 12px rgba(102,126,234,0.2)' 
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#999' }}>
                      ID: {row.aid}
                      {isCurrentAdmin && <span style={{ marginLeft: '0.5rem', color: '#27ae60', fontSize: '0.75rem' }}>(YOU)</span>}
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(row.aid)}
                      onChange={() => toggleSelect(row.aid)}
                      disabled={isCurrentAdmin}
                      style={{ 
                        cursor: isCurrentAdmin ? 'not-allowed' : 'pointer', 
                        width: '20px', 
                        height: '20px',
                        accentColor: 'var(--primary-color)',
                        opacity: isCurrentAdmin ? 0.5 : 1
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#2c3e50', marginBottom: '0.75rem' }}>
                    👤 {row.aName} {row.aSurname || ''}
                  </div>

                  <div style={{ borderTop: '1px solid #e0e0e0', margin: '0.75rem 0' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      ✉️ {row.email || '—'}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      👤 Login: {row.login || '—'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                      📅 Created: {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      🔑 Password Changed: {row.passwordLastChanged ? new Date(row.passwordLastChanged).toLocaleDateString() : 'Never'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button
                      onClick={() => {
                        setSelectedAdmin(row);
                        setNewEmail(row.email || '');
                        setShowEmailModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      ✉️ Email
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAdmin(row);
                        setShowPasswordModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '0.6rem',
                        background: 'var(--primary-gradient)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      🔑 Password
                    </button>
                  </div>
                </div>
              );
            })}
            {items.length === 0 && !loading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#7f8c8d' }}>No admin accounts</div>
            )}
          </div>

          <div style={{ flexShrink: 0, display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ 
                flex: 1,
                padding: '0.75rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ➕ Add
            </button>
            <button 
              onClick={handleBulkDelete}
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
              🗑️ Delete
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

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setNewPassword('');
          setConfirmPassword('');
          setSelectedAdmin(null);
          setError('');
        }}
        title={`🔑 Change Password`}
        maxWidth="90vw"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}
          {selectedAdmin && (
            <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>👤 {selectedAdmin.aName} {selectedAdmin.aSurname}</strong>
            </div>
          )}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>New Password:</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>Confirm Password:</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Confirm new password"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
                setSelectedAdmin(null);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              disabled={working}
              onClick={doChangePassword}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: working ? '#ccc' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: working ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {working ? 'Changing...' : 'Change'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Email Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          setNewEmail('');
          setSelectedAdmin(null);
          setError('');
        }}
        title={`✉️ Change Email`}
        maxWidth="90vw"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}
          {selectedAdmin && (
            <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <strong>👤 {selectedAdmin.aName} {selectedAdmin.aSurname}</strong>
            </div>
          )}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>✉️</span>
              <span>Email Address:</span>
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter email address"
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '0.5rem', display: 'block' }}>
              Leave empty to remove the email address
            </small>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setShowEmailModal(false);
                setNewEmail('');
                setSelectedAdmin(null);
                setError('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              disabled={working}
              onClick={doChangeEmail}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: working ? '#ccc' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: working ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {working ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Admin Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
          setError('');
        }}
        title="➕ Add New Admin"
        maxWidth="90vw"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>Name:</span>
            </label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>Surname:</span>
            </label>
            <input
              type="text"
              value={newAdmin.surname}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, surname: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>✉️</span>
              <span>Email:</span>
            </label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>Login:</span>
            </label>
            <input
              type="text"
              value={newAdmin.login}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, login: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter login username"
            />
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>Password:</span>
            </label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              placeholder="Enter password (min 6 characters)"
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setShowAddModal(false);
                setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
                setError('');
              }}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Cancel
            </button>
            <button
              disabled={working}
              onClick={doAddAdmin}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: working ? '#ccc' : 'var(--primary-gradient)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: working ? 'not-allowed' : 'pointer',
                fontWeight: 600
              }}
            >
              {working ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdminAccessMobile;
