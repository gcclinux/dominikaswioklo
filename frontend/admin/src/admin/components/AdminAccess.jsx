import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';
import AdminAccessMobile from './AdminAccessMobile';


function AdminAccess({ isOpen, onClose, currentAdmin }) {
  const [isMobile] = useState(window.innerWidth <= 768);
  
  // If mobile, render mobile component
  if (isMobile) {
    return <AdminAccessMobile isOpen={isOpen} onClose={onClose} currentAdmin={currentAdmin} />;
  }
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [working, setWorking] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
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
      setSelectedId(null);
      setShowPasswordModal(false);
      setShowAddModal(false);
      setShowEmailModal(false);
      setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
    }
  }, [isOpen]);

  const doDelete = async () => {
    if (!selectedId) return setError('Select an admin first');
    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setSelectedId(null);
      } else setError(json.error || 'Failed to delete admin');
    } catch (e) {
      setError('Failed to delete admin');
    }
    setWorking(false);
  };

  const doChangePassword = async () => {
    if (!selectedId) return setError('Select an admin first');
    if (!newPassword || !confirmPassword) return setError('Please fill in both password fields');
    if (newPassword !== confirmPassword) return setError('Passwords do not match');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters');

    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins(); // Refresh the admin list to show updated passwordLastChanged
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setSelectedId(null);
      } else setError(json.error || 'Failed to change password');
    } catch (e) {
      setError('Failed to change password');
    }
    setWorking(false);
  };

  const doChangeEmail = async () => {
    if (!selectedId) return setError('Select an admin first');

    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedId}`, {
        method: 'PUT',
        body: JSON.stringify({ email: newEmail || null })
      });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setShowEmailModal(false);
        setNewEmail('');
        setSelectedId(null);
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

  const selectedAdmin = items.find(item => item.aid === selectedId);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="🔐 Admin Access"
        maxWidth="90vw"
        maxHeight="80vh"
        closeOnOverlayClick={false}
        showCloseButton={false}
        headerContent={currentAdmin && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>
              {currentAdmin.aName} {currentAdmin.aSurname}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
              {currentAdmin.email} • {currentAdmin.login}
            </div>
          </div>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">Loading admin accounts…</span></div>}
          {error && <div className="error-message">{error}</div>}



          <div style={{ overflow: 'auto', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: 'rgba(102,126,234,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 Name</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 Surname</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>✉️ Email</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 Login</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>📅 Created</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>🔑 Password Changed</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr
                    key={row.aid}
                    onClick={() => setSelectedId(prev => prev === row.aid ? null : row.aid)}
                    style={{
                      borderBottom: '1px solid #eee',
                      background: selectedId === row.aid ? 'linear-gradient(90deg, rgba(74,144,226,0.12), rgba(74,144,226,0.06))' : idx % 2 === 0 ? 'rgba(0,0,0,0.02)' : 'transparent',
                      cursor: 'pointer',
                      fontWeight: selectedId === row.aid ? 600 : 400,
                      borderLeft: selectedId === row.aid ? '4px solid rgba(74,144,226,0.9)' : '4px solid transparent'
                    }}
                  >
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👤</span>
                        <span>{row.aName || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👤</span>
                        <span>{row.aSurname || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✉️</span>
                        <span>{row.email || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>👤</span>
                        <span>{row.login || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📅</span>
                        <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🔑</span>
                        <span>{row.passwordLastChanged ? new Date(row.passwordLastChanged).toLocaleString() : 'Never'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d' }}>No admin accounts</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="nav-button" onClick={() => setShowAddModal(true)}>Add Admin</button>
            <button
              className="nav-button"
              disabled={!selectedId || working}
              onClick={() => {
                const admin = items.find(item => item.aid === selectedId);
                setNewEmail(admin?.email || '');
                setShowEmailModal(true);
              }}
            >
              Change Email
            </button>
            <button
              className="nav-button"
              disabled={!selectedId || working}
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </button>
            <button
              className="nav-button"
              disabled={!selectedId || working || (currentAdmin && selectedId === currentAdmin.aid)}
              onClick={doDelete}
              style={{
                backgroundColor: (currentAdmin && selectedId === currentAdmin.aid) ? '#bdc3c7' : '#e74c3c',
                cursor: (currentAdmin && selectedId === currentAdmin.aid) ? 'not-allowed' : 'pointer'
              }}
              title={
                currentAdmin && selectedId === currentAdmin.aid
                  ? 'You cannot delete your own account'
                  : 'Delete selected admin account'
              }
            >
              Delete Admin
            </button>
            <button className="nav-button" onClick={onClose}>Close</button>
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
          setError('');
        }}
        title={`Change Password for ${selectedAdmin?.aName} ${selectedAdmin?.aSurname}`}
        maxWidth="400px"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}

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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Confirm new password"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              className="cancel-button"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doChangePassword}
            >
              {working ? 'Changing...' : 'Change Password'}
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
          setError('');
        }}
        title={`Change Email for ${selectedAdmin?.aName} ${selectedAdmin?.aSurname}`}
        maxWidth="400px"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}

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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter email address (leave empty to remove)"
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
              Leave empty to remove the email address
            </small>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              className="cancel-button"
              onClick={() => {
                setShowEmailModal(false);
                setNewEmail('');
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doChangeEmail}
            >
              {working ? 'Updating...' : 'Update Email'}
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
        title="Add New Admin"
        maxWidth="400px"
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter email address"
              required
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
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
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button
              className="cancel-button"
              onClick={() => {
                setShowAddModal(false);
                setNewAdmin({ name: '', surname: '', email: '', login: '', password: '' });
                setError('');
              }}
            >
              Cancel
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doAddAdmin}
            >
              {working ? 'Adding...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdminAccess;