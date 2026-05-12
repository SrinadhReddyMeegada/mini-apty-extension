import { ExtensionMessage, MessageResponse } from './messages';

/**
 * A strongly-typed wrapper around chrome.runtime.sendMessage.
 * 
 * WHY THIS IS BETTER THAN NATIVE API:
 * 1. Promisifies the callback, allowing `async/await`.
 * 2. Properly handles `chrome.runtime.lastError` (rejects the promise instead of silently failing).
 * 3. Enforces that the Response matches the Request type.
 */
export function sendExtensionMessage<M extends ExtensionMessage>(
  message: M
): Promise<MessageResponse<M['type']>> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      resolve(response as MessageResponse<M['type']>);
    });
  });
}

/**
 * A strongly-typed wrapper around chrome.tabs.sendMessage.
 * Used when the Service Worker or Popup needs to talk directly to a specific tab.
 */
export function sendTabMessage<M extends ExtensionMessage>(
  tabId: number,
  message: M
): Promise<MessageResponse<M['type']>> {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      resolve(response as MessageResponse<M['type']>);
    });
  });
}
