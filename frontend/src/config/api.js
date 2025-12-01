// Centralized API base URL for the frontend
// Uses Vite-exposed env var coming from <repo-root>/.env via vite.config.js mapping
// In production (Docker), use empty string for relative URLs (same origin)
// In development, use VITE_API_BASE_URL to proxy to backend
const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// API base - empty origin means relative URLs (works when frontend/backend same origin)
export const API = `${ORIGIN}/api`;

// Helper to build API URLs safely
export const apiUrl = (path = '') => {
  const p = String(path || '');
  return `${API}${p.startsWith('/') ? '' : '/'}${p}`;
};

export default API;
