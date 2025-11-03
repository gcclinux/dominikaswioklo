// Centralized API base URL for the frontend
// Uses Vite-exposed env var coming from <repo-root>/.env via vite.config.js mapping
// Required: set API_BASE_URL (or VITE_API_BASE_URL) in the root .env
const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// No hard-coded ports. Expect ORIGIN to be provided via env.
export const API = `${ORIGIN}/api`;

// Helper to build API URLs safely
export const apiUrl = (path = '') => {
  const p = String(path || '');
  return `${API}${p.startsWith('/') ? '' : '/'}${p}`;
};

export default API;
