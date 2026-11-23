// ORVENDIQ_SMOOTH_SCROLL_PROVIDER
import SmoothScrollProvider from './components/SmoothScrollProvider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import AuthGate from './components/AuthGate'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SmoothScrollProvider>
      <AuthGate>
      <App />
      </AuthGate>
    </SmoothScrollProvider>
  </StrictMode>,
)