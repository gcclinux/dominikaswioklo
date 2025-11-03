import React, { useState } from 'react';
import { API } from '../../config/api';

function FirstTimeSetup({ onAdminCreated }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    surname: '',
    email: '',
    login: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newAdmin.name || !newAdmin.surname || !newAdmin.email || !newAdmin.login || !newAdmin.password) {
      return setError('All fields are required');
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (newAdmin.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setWorking(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        // Now automatically log the user in with their credentials
        try {
          const loginRes = await fetch(`${API}/admins/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              login: newAdmin.login,
              password: newAdmin.password
            })
          });

          const loginJson = await loginRes.json();

          if (loginJson.success) {
            // Store admin data and token in sessionStorage (cleared when browser closes)
            sessionStorage.setItem('adminSession', JSON.stringify({
              admin: loginJson.data,
              loginTime: new Date().toISOString()
            }));
            onAdminCreated();
          } else {
            // Admin created but login failed - just proceed with onAdminCreated which will show login page
            setError('Account created! Please log in with your credentials.');
            setTimeout(() => onAdminCreated(), 2000);
          }
        } catch (loginErr) {
          // Admin created but login failed - just proceed
          setError('Account created! Please log in with your credentials.');
          setTimeout(() => onAdminCreated(), 2000);
        }
      } else {
        setError(json.error || 'Failed to create admin account');
      }
    } catch (e) {
      setError('Failed to create admin account');
    }
    
    setWorking(false);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--primary-gradient)',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>🚀 First Time Setup</h2>
        <p style={{ margin: '0 0 1.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
          Create your first admin account to get started
        </p>

        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '6px',
            color: '#c33',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              First Name *
            </label>
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter first name"
              disabled={working}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Last Name *
            </label>
            <input
              type="text"
              value={newAdmin.surname}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, surname: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Enter last name"
              disabled={working}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Email *
            </label>
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="admin@example.com"
              disabled={working}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Username *
            </label>
            <input
              type="text"
              value={newAdmin.login}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, login: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="admin"
              disabled={working}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Password *
            </label>
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Min 6 characters"
              disabled={working}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#2c3e50' }}>
              Confirm Password *
            </label>
            <input
              type="password"
              value={newAdmin.confirmPassword}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              placeholder="Re-enter password"
              disabled={working}
            />
          </div>

          <button
            type="submit"
            disabled={working}
            style={{
              padding: '0.75rem',
              background: working ? '#95a5a6' : 'var(--primary-gradient)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: working ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem'
            }}
          >
            {working ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FirstTimeSetup;
