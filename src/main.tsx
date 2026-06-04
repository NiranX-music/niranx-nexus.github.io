import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import { AccessibilityProvider } from './contexts/AccessibilityContext'

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </HelmetProvider>
);
