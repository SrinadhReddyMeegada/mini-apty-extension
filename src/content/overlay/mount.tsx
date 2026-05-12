import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OverlayApp } from './OverlayApp';
import { ReplayEngineUI } from '../replay/ReplayEngineUI';

/**
 * Creates an isolated Shadow DOM root and mounts our React apps inside it.
 */
export function mountOverlay() {
  if (document.getElementById('mini-apty-host')) return;

  const host = document.createElement('div');
  host.id = 'mini-apty-host';
  host.style.position = 'fixed';
  host.style.top = '0';
  host.style.left = '0';
  host.style.width = '0';
  host.style.height = '0';
  host.style.overflow = 'visible';
  host.style.zIndex = '2147483647';
  
  const shadowRoot = host.attachShadow({ mode: 'open' });
  
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    * { box-sizing: border-box; }
  `;
  shadowRoot.appendChild(style);

  const container = document.createElement('div');
  container.id = 'mini-apty-root';
  shadowRoot.appendChild(container);
  
  document.body.appendChild(host);

  // Mount both Author and Replay modes
  createRoot(container).render(
    <StrictMode>
      <OverlayApp />
      <ReplayEngineUI />
    </StrictMode>
  );

  console.log('[Mini Apty] Shadow DOM overlay mounted');
}
