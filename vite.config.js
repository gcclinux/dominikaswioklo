import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname), '')
  
  return {
    plugins: [react()],
    base: '/',
    define: {
  'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || 'http://localhost:5000')
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
