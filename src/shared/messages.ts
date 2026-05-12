/**
 * Mini Apty — Message Contracts
 *
 * WHY WE DO THIS:
 * In a Chrome extension, the Service Worker, Content Script, and Popup run in
 * completely isolated JavaScript environments. They communicate via serialized JSON.
 *
 * If we use ad-hoc strings like `chrome.runtime.sendMessage({ action: "start" })`,
 * we will inevitably face typos, missing payloads, or unhandled messages.
 *
 * By defining a Discriminated Union of message types, TypeScript will:
 * 1. Force us to include required payload fields when sending.
 * 2. Give us auto-complete in our switch statements in the message listener.
 * 3. Ensure we return the correct Response type for each Request type.
 */

export interface PingMessage {
  type: 'PING';
}

export interface ContentScriptReadyMessage {
  type: 'CONTENT_SCRIPT_READY';
  url: string;
}

export interface ToggleDrawerMessage {
  type: 'TOGGLE_DRAWER';
}

export interface PlayWalkthroughMessage {
  type: 'PLAY_WALKTHROUGH';
  walkthroughId: string;
}

/**
 * Discriminated union of all messages that can be sent in the extension.
 */
export type ExtensionMessage =
  | PingMessage
  | ContentScriptReadyMessage
  | ToggleDrawerMessage
  | PlayWalkthroughMessage;

/**
 * Maps a specific Message type to its expected Response type.
 * This allows us to have a fully typed request/response cycle.
 */
export type MessageResponse<T extends ExtensionMessage['type']> = 
  T extends 'PING' ? { ok: true; context: string } :
  T extends 'CONTENT_SCRIPT_READY' ? { ok: true } :
  T extends 'TOGGLE_DRAWER' ? { ok: true; isOpen: boolean } :
  T extends 'PLAY_WALKTHROUGH' ? { ok: true } :
  { ok: boolean; error?: string }; // Fallback
