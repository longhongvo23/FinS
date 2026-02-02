import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initSentry } from './lib/sentry'
import './index.css'

// Initialize error tracking (production only)
initSentry()

createRoot(document.getElementById('root')!).render(
  // Temporarily disabled StrictMode to fix TradingView widget issues
  // <StrictMode>
  <App />,
  // </StrictMode>,
)
