import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '')
  
  return {
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    // Use empty string for production (relative URLs), or env var for development
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || ''),
    'import.meta.env.VITE_ADMIN_DEV_MODE': JSON.stringify(env.VITE_ADMIN_DEV_MODE || 'false'),
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
}})
