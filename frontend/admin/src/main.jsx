import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
)