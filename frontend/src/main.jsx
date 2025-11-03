import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import App from './App.jsx'

// Initialize theme before rendering
const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
fetch(`${API}/api/settings`)
  .then(res => res.json())
  .then(data => {
    if (data.success && data.data.siteTheme) {
      document.documentElement.setAttribute('data-theme', data.data.siteTheme);
    }
  })
  .catch(err => console.error('Error loading theme:', err));

// Render app immediately (theme will update when loaded)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
