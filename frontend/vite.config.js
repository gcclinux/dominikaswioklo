import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || env.API_BASE_URL || 'http://localhost:5000'),
    'import.meta.env.VITE_ADMIN_DEV_MODE': JSON.stringify(env.VITE_ADMIN_DEV_MODE || 'false'),
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
}})
