import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AccessibilityProvider } from './contexts/AccessibilityContext'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext'

createRoot(document.getElementById("root")!).render(
  <AccessibilityProvider>
    <MusicPlayerProvider>
      <App />
    </MusicPlayerProvider>
  </AccessibilityProvider>
);
