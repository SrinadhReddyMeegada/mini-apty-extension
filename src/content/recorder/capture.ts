import { generateSelectorMetadata } from '../dom/engine';
import { highlightElement, clearHighlight } from '../dom/highlighter';
import { useAuthorStore } from '../store/authorStore';

let isRecordingActive = false;

function handleMouseOver(e: MouseEvent) {
  if (!isRecordingActive) return;
  const target = e.target as HTMLElement;
  
  // Protect our own extension UI from being targeted
  if (target.id === 'mini-apty-host' || target.closest('#mini-apty-host')) return;
  
  highlightElement(target);
}

function handleMouseOut() {
  if (!isRecordingActive) return;
  clearHighlight();
}

function handleClick(e: MouseEvent) {
  if (!isRecordingActive) return;
  
  const target = e.target as HTMLElement;
  
  // If the user clicks inside our Author Drawer, let the click pass through normally!
  if (target.id === 'mini-apty-host' || target.closest('#mini-apty-host')) return;

  // Intercept the click so the host page doesn't actually trigger its button/link
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();

  // Generate the robust metadata profile
  const metadata = generateSelectorMetadata(target);
  
  // Dispatch to our Zustand store
  useAuthorStore.getState().addStep(metadata);
  
  // Flash the highlight or clear it to acknowledge capture
  clearHighlight();
}

/**
 * Initializes the recorder by subscribing to the Zustand store.
 * 
 * WHY THIS ARCHITECTURE:
 * Instead of passing callbacks deep into React components, we keep the DOM
 * event listeners strictly decoupled. They just subscribe to Zustand.
 * When a user clicks "Start Recording" in the React UI, the store updates,
 * and this subscription attaches the global window listeners.
 */
export function initRecorder() {
  useAuthorStore.subscribe((state) => {
    if (state.isRecording && !isRecordingActive) {
      isRecordingActive = true;
      // Use the 'capture' phase (true) to intercept clicks BEFORE the host page sees them
      document.addEventListener('mouseover', handleMouseOver, true);
      document.addEventListener('mouseout', handleMouseOut, true);
      document.addEventListener('click', handleClick, true);
      console.log('[Mini Apty] Recording started');
    } else if (!state.isRecording && isRecordingActive) {
      isRecordingActive = false;
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleClick, true);
      clearHighlight();
      console.log('[Mini Apty] Recording stopped');
    }
  });
}
