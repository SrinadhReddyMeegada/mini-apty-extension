import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

/**
 * Popup React entry point.
 *
 * IMPORTANT LIFECYCLE FACT:
 * This entire React tree is created fresh every time the user clicks
 * the extension icon, and completely destroyed when they click away.
 * There is NO persistent React state between popup opens.
 *
 * That's why all important state lives in chrome.storage.local or Zustand
 * stores that rehydrate from storage on mount.
 */

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
