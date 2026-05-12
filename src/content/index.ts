import { sendExtensionMessage } from '../shared/messaging';
import { ExtensionMessage } from '../shared/messages';
import { mountOverlay } from './overlay/mount';
import { initRecorder } from './recorder/capture';
import { getWalkthroughs } from '../shared/storage';
import { useReplayStore } from './store/replayStore';

console.log('[Mini Apty] Content script loaded on:', window.location.href);

// Mount the React overlay immediately
mountOverlay();

// Initialize the event listeners that respond to Zustand state
initRecorder();

// We wrap initialization in an async IIFE so we can use await
(async () => {
  try {
    const response = await sendExtensionMessage({
      type: 'CONTENT_SCRIPT_READY',
      url: window.location.href,
    });
    console.log('[Mini Apty] Service worker acknowledged readiness:', response.ok);
  } catch (error) {
    console.warn('[Mini Apty] SW not reachable (normal on first load):', error);
  }
})();

chrome.runtime.onMessage.addListener((untypedMessage, _sender, sendResponse) => {
  const message = untypedMessage as ExtensionMessage;
  
  switch (message.type) {
    case 'PING':
      sendResponse({ ok: true, context: 'content-script' });
      break;
      
    case 'TOGGLE_DRAWER':
      const currentState = document.getElementById('mini-apty-host')
        ?.shadowRoot?.getElementById('mini-apty-root')
        ?.innerHTML.includes('Mini Apty Author');
        
      const newState = !currentState;
      window.dispatchEvent(new CustomEvent('MINI_APTY_TOGGLE_DRAWER', { 
        detail: { isOpen: newState } 
      }));
      
      sendResponse({ ok: true, isOpen: newState });
      break;

    case 'PLAY_WALKTHROUGH':
      // 1. We must async fetch from storage because the message only gives us the ID
      // (This is better than passing massive JSON blobs via message passing)
      getWalkthroughs().then(walkthroughs => {
        const w = walkthroughs.find(w => w.id === message.walkthroughId);
        if (w) {
          useReplayStore.getState().startReplay(w);
          sendResponse({ ok: true });
        } else {
          sendResponse({ ok: false, error: 'Walkthrough not found in storage' });
        }
      });
      return true; // Keep channel open for async response

    default:
      sendResponse({ ok: false, error: 'Unhandled in content script' });
  }
  return true;
});
