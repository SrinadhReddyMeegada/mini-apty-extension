let highlightBox: HTMLDivElement | null = null;

/**
 * Renders an absolutely positioned bounding box over a target element.
 * Uses a detached floating div to prevent mutating host page CSS/layout.
 */
export function highlightElement(el: HTMLElement) {
  if (!highlightBox) {
    highlightBox = document.createElement('div');
    highlightBox.id = 'mini-apty-highlight';
    
    // Position fixed to the viewport
    highlightBox.style.position = 'fixed';
    // Pass-through clicks to underlying host elements

    highlightBox.style.pointerEvents = 'none'; 
    highlightBox.style.zIndex = '2147483646'; // Just under the drawer's shadow root
    highlightBox.style.border = '2px solid #4CAF50';
    highlightBox.style.backgroundColor = 'rgba(76, 175, 80, 0.15)';
    highlightBox.style.transition = 'all 0.1s ease-out';
    highlightBox.style.borderRadius = '4px';
    document.body.appendChild(highlightBox);
  }

  const rect = el.getBoundingClientRect();
  // We use `position: fixed` so getBoundingClientRect() maps exactly 1:1 without
  // needing to calculate window.scrollY offsets.
  highlightBox.style.top = `${rect.top}px`;
  highlightBox.style.left = `${rect.left}px`;
  highlightBox.style.width = `${rect.width}px`;
  highlightBox.style.height = `${rect.height}px`;
}

export function clearHighlight() {
  if (highlightBox) {
    highlightBox.style.width = '0';
    highlightBox.style.height = '0';
    highlightBox.style.border = 'none';
  }
}
