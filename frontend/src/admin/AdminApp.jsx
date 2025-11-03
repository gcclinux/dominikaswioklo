import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Settings from './pages/Settings.jsx';
import Documentation from './pages/Documentation.jsx';
import './pages/Settings.css';
import AdminAppointments from './components/AdminAppointments.jsx';
import AdminBlockedList from './components/AdminBlockedList.jsx';
import AdminUsersList from './components/AdminUsersList.jsx';
import AdminAccess from './components/AdminAccess.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import BrandingFooter from '../components/BrandingFooter.jsx';
import FirstTimeSetup from './components/FirstTimeSetup.jsx';
import PremiumUpgradeModal from './components/PremiumUpgradeModal.jsx';
import LicenseDetailsModal from './components/LicenseDetailsModal.jsx';
import { API } from '../config/api';

function Dashboard({ currentAdmin, onLogout, isDevelopmentMode }) {
  const navigate = useNavigate();
  const [showAppointments, setShowAppointments] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showLicenseDetails, setShowLicenseDetails] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Check license status
  const checkLicense = async () => {
    try {
  const res = await fetch(`${API}/license`);
      const json = await res.json();
      if (json.success) {
        setIsPremium(json.data.isPremium && json.data.isValid);
      }
    } catch (e) {
      console.error('Failed to check license:', e);
    }
  };

  React.useEffect(() => {
    checkLicense();
  }, []);
  const tiles = [
    { id: 'settings', title: 'Settings', description: 'Configure system settings, working hours, availability, and messages', icon: '⚙️', color: '#4A90E2', onClick: () => navigate('settings') },
    { id: 'users', title: 'Users', description: 'View and manage registered users and their appointments', icon: '👥', color: '#50C878', onClick: () => setShowUsers(true) },
    { id: 'blocked', title: 'Blocked', description: 'Manage blocked users and IP addresses', icon: '🚫', color: '#E74C3C', onClick: () => setShowBlocked(true) },
    { id: 'appointments', title: 'Scheduled Appointments', description: 'View, confirm, and manage all appointments', icon: '📅', color: '#9B59B6', onClick: () => setShowAppointments(true) },
    { id: 'admin', title: 'Admin', description: 'Manage admin users and access controls', icon: '🔐', color: '#F39C12', onClick: () => setShowAdmin(true) },
    { id: 'documentation', title: 'Documentation', description: 'Browse system documentation and guides', icon: '📚', color: '#3498db', onClick: () => navigate('documentation') },
    { id: 'scheduler', title: 'Open Scheduler', description: 'View the public appointment booking page', icon: '🌐', color: '#16A085', isExternal: true, url: '/#/easyscheduler' },
    { id: 'license', title: 'License', description: isPremium ? 'View premium license details' : 'Upgrade to premium and unlock all features', icon: isPremium ? '✅' : '🔓', color: isPremium ? '#27ae60' : '#e67e22', onClick: () => isPremium ? setShowLicenseDetails(true) : setShowPremiumModal(true) },
    { id: 'logout', title: 'Logout', description: `👤 ${currentAdmin.aName} ${currentAdmin.aSurname} • ✉️ ${currentAdmin.email}`, icon: '🚪', color: '#e74c3c', onClick: onLogout, mobileOnly: true },
  ];

  const handleTileClick = (tile) => {
    if (tile.isExternal) {
      window.open(tile.url, '_blank');
    } else if (tile.onClick) {
      tile.onClick();
    } else {
      alert(`${tile.title} page - Coming soon!`);
    }
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>📊 Scheduler Admin Dashboard {isDevelopmentMode && <span style={{ color: '#f39c12', fontSize: '0.8rem' }}>🚧 DEV MODE</span>}</h1>
            <p className="settings-subtitle">Manage your appointment scheduling system</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#fff', fontWeight: '500', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <span>👤</span>
                <span>Welcome, <strong>{currentAdmin.aName} {currentAdmin.aSurname}</strong></span>
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.95, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <span>✉️</span>
                <span>{currentAdmin.email}</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: '0.5rem 1rem',
                background: isDevelopmentMode ? '#95a5a6' : '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isDevelopmentMode ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
              title={isDevelopmentMode ? 'Logout disabled in development mode' : 'Logout'}
            >
              {isDevelopmentMode ? 'Dev Mode' : 'Logout'}
            </button>
          </div>
        </div>
      </header>
      <main className="settings-main">
        <div className="settings-grid">
          {tiles.map((tile) => (
            <div key={tile.id} className="setting-tile" style={{ '--setting-color': tile.color }} onClick={() => handleTileClick(tile)} data-mobile-only={tile.mobileOnly || false}>
              <div className="setting-icon">{tile.icon}</div>
              <h3 className="setting-title">{tile.title}</h3>
              <p className="setting-description">{tile.description}</p>
              {tile.isExternal && <span className="action-label">↗</span>}
            </div>
          ))}
        </div>
      </main>
      <footer className="settings-footer">
        <p>Scheduler Admin v1.0.0 | © 2025</p>
        <BrandingFooter isPremium={isPremium} />
      </footer>
      <AdminAppointments isOpen={showAppointments} onClose={() => setShowAppointments(false)} />
      <AdminBlockedList isOpen={showBlocked} onClose={() => setShowBlocked(false)} />
      <AdminUsersList isOpen={showUsers} onClose={() => setShowUsers(false)} />
      <AdminAccess isOpen={showAdmin} onClose={() => setShowAdmin(false)} currentAdmin={currentAdmin} />
      
      <PremiumUpgradeModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={() => {
          setShowPremiumModal(false);
          checkLicense();
        }}
      />
      
      <LicenseDetailsModal 
        isOpen={showLicenseDetails} 
        onClose={() => setShowLicenseDetails(false)}
      />
    </div>
  );
}

function AdminApp() {
  const navigate = useNavigate();
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdmins, setHasAdmins] = useState(true);

  // Check if development mode is enabled (bypasses authentication)
  const isDevelopmentMode = import.meta.env.VITE_ADMIN_DEV_MODE === 'true';

  // Check if any admin exists
  const checkAdminExists = async () => {
    try {
  const res = await fetch(`${API}/admins/check`);
      const json = await res.json();
      if (json.success) {
        setHasAdmins(json.data.hasAdmins);
      }
    } catch (error) {
      console.error('Error checking admin existence:', error);
    }
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      // First check if any admin exists
      await checkAdminExists();
      // In development mode, bypass authentication
      if (isDevelopmentMode) {
        console.log('🚧 Development mode: Admin authentication bypassed');
        setCurrentAdmin({
          aid: 999,
          aName: 'Dev',
          aSurname: 'Admin',
          email: 'dev@localhost',
          login: 'dev-admin',
          passwordLastChanged: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      try {
        const sessionData = sessionStorage.getItem('adminSession');
        if (sessionData) {
          const { admin, loginTime } = JSON.parse(sessionData);

          // Check if session is less than 24 hours old
          const loginDate = new Date(loginTime);
          const now = new Date();
          const hoursDiff = (now - loginDate) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setCurrentAdmin(admin);
          } else {
            // Session expired, clear it
            sessionStorage.removeItem('adminSession');
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        sessionStorage.removeItem('adminSession');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [isDevelopmentMode]);

  // Handle first-time setup completion
  const handleAdminCreated = () => {
    setHasAdmins(true);
    setIsLoading(false);
  };

  const handleLoginSuccess = (admin) => {
    setCurrentAdmin(admin);
  };

  const handleLogout = () => {
    if (isDevelopmentMode) {
      console.log('🚧 Development mode: Logout disabled');
      return;
    }
    sessionStorage.removeItem('adminSession');
    setCurrentAdmin(null);
    navigate('/admin'); // Redirect to login
  };

  // Show loading spinner while checking session
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '1.2rem' }}>
          <span style={{
            display: 'inline-block',
            width: '20px',
            height: '20px',
            border: '2px solid #fff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginRight: '0.5rem'
          }} />
          Loading...
        </div>
      </div>
    );
  }

  // Show first-time setup if no admins exist
  if (!hasAdmins && !isDevelopmentMode) {
    return <FirstTimeSetup onAdminCreated={handleAdminCreated} />;
  }

  // Show login if not authenticated (unless in development mode)
  if (!currentAdmin && !isDevelopmentMode) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }



  // Show admin dashboard if authenticated
  return (
    <Routes>
      <Route index element={<Dashboard currentAdmin={currentAdmin} onLogout={handleLogout} isDevelopmentMode={isDevelopmentMode} />} />
      <Route path="settings" element={<Settings onBack={() => navigate(-1)} currentAdmin={currentAdmin} onLogout={handleLogout} isDevelopmentMode={isDevelopmentMode} />} />
      <Route path="documentation" element={<Documentation onBack={() => navigate(-1)} />} />
      <Route path="*" element={<Dashboard currentAdmin={currentAdmin} onLogout={handleLogout} isDevelopmentMode={isDevelopmentMode} />} />
    </Routes>
  );
}

export default AdminApp;
