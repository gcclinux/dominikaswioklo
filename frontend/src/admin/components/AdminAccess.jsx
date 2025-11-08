import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import './NumberSettingEditor.css';
import { API } from '../../config/api';
import { authenticatedFetch } from '../utils/apiHelper';
import AdminAccessMobile from './AdminAccessMobile';
import { useAdminTranslation } from '../utils/useAdminTranslation';


function AdminAccess({ isOpen, onClose, currentAdmin }) {
  const { t } = useAdminTranslation();
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
      else setError(json.error || t('adminAccess.errors.loadFailed'));
    } catch (e) {
      setError(t('adminAccess.errors.loadFailed'));
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
    if (!selectedId) return setError(t('adminAccess.errors.selectFirst'));
    setWorking(true);
    setError('');
    try {
      const res = await authenticatedFetch(`${API}/admins/${selectedId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        await fetchAdmins();
        setSelectedId(null);
      } else setError(json.error || t('adminAccess.errors.deleteFailed'));
    } catch (e) {
      setError(t('adminAccess.errors.deleteFailed'));
    }
    setWorking(false);
  };

  const doChangePassword = async () => {
    if (!selectedId) return setError(t('adminAccess.errors.selectFirst'));
    if (!newPassword || !confirmPassword) return setError(t('adminAccess.errors.fillBothPasswords'));
    if (newPassword !== confirmPassword) return setError(t('adminAccess.errors.passwordsNoMatch'));
    if (newPassword.length < 6) return setError(t('adminAccess.errors.passwordTooShort'));

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
      } else setError(json.error || t('adminAccess.errors.passwordChangeFailed'));
    } catch (e) {
      setError(t('adminAccess.errors.passwordChangeFailed'));
    }
    setWorking(false);
  };

  const doChangeEmail = async () => {
    if (!selectedId) return setError(t('adminAccess.errors.selectFirst'));

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
      } else setError(json.error || t('adminAccess.errors.emailChangeFailed'));
    } catch (e) {
      setError(t('adminAccess.errors.emailChangeFailed'));
    }
    setWorking(false);
  };

  const doAddAdmin = async () => {
    if (!newAdmin.name || !newAdmin.surname || !newAdmin.email || !newAdmin.login || !newAdmin.password) {
      return setError(t('adminAccess.errors.allFieldsRequired'));
    }
    if (newAdmin.password.length < 6) return setError(t('adminAccess.errors.passwordTooShort'));

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
      } else setError(json.error || t('adminAccess.errors.addFailed'));
    } catch (e) {
      setError(t('adminAccess.errors.addFailed'));
    }
    setWorking(false);
  };

  const selectedAdmin = items.find(item => item.aid === selectedId);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`🔐 ${t('adminAccess.title')}`}
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

          {loading && <div className="info-box"><span className="info-icon">⏳</span><span className="info-text">{t('adminAccess.loading')}</span></div>}
          {error && <div className="error-message">{error}</div>}



          <div style={{ overflow: 'auto', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, tableLayout: 'auto' }}>
              <thead>
                <tr style={{ background: 'rgba(102,126,234,0.08)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 {t('adminAccess.table.name')}</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 {t('adminAccess.table.surname')}</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>✉️ {t('adminAccess.table.email')}</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>👤 {t('adminAccess.table.login')}</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>📅 {t('adminAccess.table.created')}</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem' }}>🔑 {t('adminAccess.table.passwordChanged')}</th>
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
                        <span>{row.passwordLastChanged ? new Date(row.passwordLastChanged).toLocaleString() : t('adminAccess.table.never')}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: '#7f8c8d' }}>{t('adminAccess.noAdmins')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button className="nav-button" onClick={() => setShowAddModal(true)}>{t('adminAccess.buttons.addAdmin')}</button>
            <button
              className="nav-button"
              disabled={!selectedId || working}
              onClick={() => {
                const admin = items.find(item => item.aid === selectedId);
                setNewEmail(admin?.email || '');
                setShowEmailModal(true);
              }}
            >
              {t('adminAccess.buttons.changeEmail')}
            </button>
            <button
              className="nav-button"
              disabled={!selectedId || working}
              onClick={() => setShowPasswordModal(true)}
            >
              {t('adminAccess.buttons.changePassword')}
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
                  ? t('adminAccess.buttons.cannotDeleteSelf')
                  : t('adminAccess.buttons.deleteAdminTooltip')
              }
            >
              {t('adminAccess.buttons.deleteAdmin')}
            </button>
            <button className="nav-button" onClick={onClose}>{t('common.close')}</button>
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
        title={t('adminAccess.changePassword.title', { name: `${selectedAdmin?.aName} ${selectedAdmin?.aSurname}` })}
        maxWidth="400px"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>{t('adminAccess.changePassword.newPassword')}</span>
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
              placeholder={t('adminAccess.changePassword.newPasswordPlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>{t('adminAccess.changePassword.confirmPassword')}</span>
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
              placeholder={t('adminAccess.changePassword.confirmPasswordPlaceholder')}
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
              {t('common.cancel')}
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doChangePassword}
            >
              {working ? t('adminAccess.changePassword.changing') : t('adminAccess.changePassword.changeButton')}
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
        title={t('adminAccess.changeEmail.title', { name: `${selectedAdmin?.aName} ${selectedAdmin?.aSurname}` })}
        maxWidth="400px"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>✉️</span>
              <span>{t('adminAccess.changeEmail.emailLabel')}</span>
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
              placeholder={t('adminAccess.changeEmail.emailPlaceholder')}
            />
            <small style={{ color: '#666', fontSize: '12px', marginTop: '0.25rem', display: 'block' }}>
              {t('adminAccess.changeEmail.emptyHint')}
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
              {t('common.cancel')}
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doChangeEmail}
            >
              {working ? t('adminAccess.changeEmail.updating') : t('adminAccess.changeEmail.updateButton')}
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
        title={t('adminAccess.addAdmin.title')}
        maxWidth="400px"
        closeOnOverlayClick={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && <div className="error-message">{error}</div>}

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>{t('adminAccess.addAdmin.nameLabel')}</span>
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
              placeholder={t('adminAccess.addAdmin.namePlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>{t('adminAccess.addAdmin.surnameLabel')}</span>
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
              placeholder={t('adminAccess.addAdmin.surnamePlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>✉️</span>
              <span>{t('adminAccess.addAdmin.emailLabel')}</span>
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
              placeholder={t('adminAccess.addAdmin.emailPlaceholder')}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>👤</span>
              <span>{t('adminAccess.addAdmin.loginLabel')}</span>
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
              placeholder={t('adminAccess.addAdmin.loginPlaceholder')}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 500 }}>
              <span>🔑</span>
              <span>{t('adminAccess.addAdmin.passwordLabel')}</span>
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
              placeholder={t('adminAccess.addAdmin.passwordPlaceholder')}
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
              {t('common.cancel')}
            </button>
            <button
              className="nav-button"
              disabled={working}
              onClick={doAddAdmin}
            >
              {working ? t('adminAccess.addAdmin.adding') : t('adminAccess.addAdmin.addButton')}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AdminAccess;