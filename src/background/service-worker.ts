import { ExtensionMessage } from '../shared/messages';

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[Mini Apty] Extension installed');
  }
});

// We must assert the type of `message` because Chrome's native API is untyped.
// But our `sendExtensionMessage` ensures the sender sends the right shape.
chrome.runtime.onMessage.addListener((untypedMessage, sender, sendResponse) => {
  const message = untypedMessage as ExtensionMessage;
  console.log('[Mini Apty SW] Message received:', message.type, 'from:', sender.tab?.url ?? 'popup');

  // The power of discriminated unions: TypeScript knows `message` has specific
  // payload fields based on `message.type`.
  switch (message.type) {
    case 'PING':
      sendResponse({ ok: true, context: 'service-worker' });
      break;

    case 'CONTENT_SCRIPT_READY':
      console.log('Content script ready on:', message.url);
      sendResponse({ ok: true });
      break;

    default:
      console.warn('Unhandled message type:', (message as any).type);
      sendResponse({ ok: false, error: 'Unhandled message type' });
  }

  // IMPORTANT: Return true to keep the message channel open for async responses.
  return true;
});

console.log('[Mini Apty] Service worker loaded');
