import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Register PWA service worker cleanly for offline capability and automatic updates
try {
  registerSW({
    immediate: true,
    onOfflineReady() {
      console.log('[PWA] App ready to work offline.');
    },
    onRegisterError(error) {
      console.warn('[PWA] Service worker registration skipped/failed:', error);
    },
  });
} catch (err) {
  console.warn('[PWA] Registration unavailable:', err);
}

// Guard against unhandled promise rejections in background network syncs
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[SafetyGuard] Prevented unhandled promise rejection:', event.reason);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
