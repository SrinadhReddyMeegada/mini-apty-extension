let highlightBox: HTMLDivElement | null = null;

/**
 * Creates a floating overlay div that tracks the target element.
 * 
 * WHY NOT JUST ADD A CSS CLASS TO THE TARGET ELEMENT?
 * If we add `border: 2px solid green` to the host page's elements, we risk breaking
 * their layout. If they have `overflow: hidden`, our border might get clipped.
 * Instead, we use an absolutely positioned invisible div on top of the viewport.
 */
export function highlightElement(el: HTMLElement) {
  if (!highlightBox) {
    highlightBox = document.createElement('div');
    highlightBox.id = 'mini-apty-highlight';
    
    // Position fixed to the viewport
    highlightBox.style.position = 'fixed';
    // Pointer-events: none is CRITICAL. It ensures that when the user clicks,
    // the click passes THROUGH the highlight box and hits the actual element below it.
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
