import { useState, useEffect } from 'react';
import { SelectorMetadata } from '../../shared/types';
import { findElementByMetadata } from '../dom/engine';

interface TrackerState {
  targetRect: DOMRect | null;
  targetElement: HTMLElement | null;
}

/**
 * Custom hook to track an element's position on the screen, even if it is lazily
 * loaded by an SPA or moves around the viewport.
 */
export function useElementTracker(meta?: SelectorMetadata, pollInterval = 250): TrackerState {
  const [state, setState] = useState<TrackerState>({ targetRect: null, targetElement: null });

  useEffect(() => {
    if (!meta) {
      setState({ targetRect: null, targetElement: null });
      return;
    }

    let isChecking = false;

    // The core validation logic, extracted so both the Observer and Interval can use it
    const checkElement = () => {
      if (isChecking) return;
      isChecking = true;

      try {
        const el = findElementByMetadata(meta);

        if (el) {
          const newRect = el.getBoundingClientRect();

          // Treat elements with 0 dimensions as invisible/unmounted
          if (newRect.width === 0 || newRect.height === 0) {
            setState({ targetRect: null, targetElement: null });
            return;
          }

          setState((prev) => {
            if (
              prev.targetElement === el &&
              prev.targetRect &&
              Math.abs(prev.targetRect.top - newRect.top) <= 2 &&
              Math.abs(prev.targetRect.left - newRect.left) <= 2
            ) {
              return prev;
            }
            return { targetRect: newRect, targetElement: el };
          });
        } else {
          setState({ targetRect: null, targetElement: null });
        }
      } finally {
        isChecking = false;
      }
    };

    // 1. PRIMARY SIGNAL: MutationObserver (Debounced)
    // Reacts instantly to DOM additions/removals
    let debounceTimer: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        checkElement();
      }, 50); // Wait 50ms for React/SPA to finish its batch mutations
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'id'] // Only care about attributes that affect visibility/targeting
    });

    // 2. FALLBACK SIGNAL: Polling Loop
    // Catches edge cases like CSS transitions, network-delayed images, or window resizing
    const interval = setInterval(checkElement, pollInterval);

    // Initial check
    checkElement();

    // MEMORY SAFETY: Strict Cleanup
    return () => {
      clearInterval(interval);
      clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [meta, pollInterval]);

  return state;
}
