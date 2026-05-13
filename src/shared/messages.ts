/**
 * Extension Message Contracts
 * 
 * Defines the Discriminated Union of all valid cross-environment messages
 * to ensure type-safe JSON serialization between Popup, Service Worker, and Content Script.
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
