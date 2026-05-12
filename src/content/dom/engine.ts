import { SelectorMetadata } from '../../shared/types';

// --- GENERATION: CAPTURING THE ELEMENT ---

/**
 * Given an element clicked by the author, generate a rich metadata profile.
 */
export function generateSelectorMetadata(el: HTMLElement): SelectorMetadata {
  return {
    tagName: el.tagName.toUpperCase(),
    testId: getTestId(el),
    id: isStableId(el.id) ? el.id : undefined,
    ariaLabel: el.getAttribute('aria-label') || undefined,
    role: el.getAttribute('role') || undefined,
    textContent: getDirectTextContent(el),
    classList: Array.from(el.classList).filter(isStableClass),
    cssPath: generateRobustCssPath(el),
    xpath: generateXPath(el)
  };
}

function getTestId(el: HTMLElement): string | undefined {
  return el.getAttribute('data-testid') || 
         el.getAttribute('data-test-id') || 
         el.getAttribute('data-test') || 
         undefined;
}

// Regex to detect IDs that look generated (e.g., react-aria-123, headlessui-menu-4)
function isStableId(id: string): boolean {
  if (!id) return false;
  const dynamicPatterns = [/\d{3,}/, /-[a-zA-Z0-9]{8}-/, /^headlessui-/, /^react-aria-/];
  return !dynamicPatterns.some(pattern => pattern.test(id));
}

// Same for classes (e.g., styled-components css-1h2gf, tailwind arbitrary variants)
function isStableClass(className: string): boolean {
  const dynamicPatterns = [/^css-/, /^styled__/, /-[a-zA-Z0-9]{5,}$/];
  return !dynamicPatterns.some(pattern => pattern.test(className));
}

// We only want the direct text of the element, not a massive string of all child text.
function getDirectTextContent(el: HTMLElement): string | undefined {
  let text = '';
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      text += child.textContent;
    }
  }
  const clean = text.trim();
  return clean.length > 0 && clean.length < 100 ? clean : undefined;
}

// Generates a structural path, stopping early if it hits a stable ID
function generateRobustCssPath(el: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = el;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id && isStableId(current.id)) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break; // Safe to stop, ID is unique
    }
    
    let siblingIndex = 1;
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === current.tagName) {
        siblingIndex++;
      }
      sibling = sibling.previousElementSibling;
    }
    
    if (siblingIndex > 1) {
      selector += `:nth-of-type(${siblingIndex})`;
    }
    
    path.unshift(selector);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

function generateXPath(el: HTMLElement): string {
  if (el.id && isStableId(el.id)) {
    return `//*[@id="${el.id}"]`;
  }
  if (el === document.body) return '/html/body';
  
  let ix = 0;
  const siblings = el.parentNode?.childNodes;
  if (!siblings) return '';
  
  for (let i = 0; i < siblings.length; i++) {
    const sibling = siblings[i] as HTMLElement;
    if (sibling === el) {
      return generateXPath(el.parentNode as HTMLElement) + '/' + el.tagName.toLowerCase() + '[' + (ix + 1) + ']';
    }
    if (sibling.nodeType === 1 && sibling.tagName === el.tagName) ix++;
  }
  return '';
}

// --- RESOLUTION: FINDING THE ELEMENT DURING PREVIEW ---

/**
 * The core engine function. Given a metadata profile, it scores candidate elements
 * on the current DOM and returns the best match.
 */
function calculateScore(candidate: Element, meta: SelectorMetadata): number {
  let score = 0;
  
  if (meta.ariaLabel && candidate.getAttribute('aria-label') === meta.ariaLabel) score += 40;
  if (meta.role && candidate.getAttribute('role') === meta.role) score += 20;
  
  const candidateText = getDirectTextContent(candidate as HTMLElement);
  if (meta.textContent && candidateText === meta.textContent) score += 30;
  
  let classMatchCount = 0;
  const candidateClasses = Array.from(candidate.classList);
  for (const cls of meta.classList) {
    // Ignore dynamic classes like "bg-token-xyz" if possible, but for now just count exact matches
    if (candidateClasses.includes(cls)) classMatchCount++;
  }
  if (meta.classList.length > 0) {
    score += (classMatchCount / meta.classList.length) * 20;
  }
  
  return score;
}

export function findElementByMetadata(meta: SelectorMetadata): HTMLElement | null {
  // 1. Silver Bullets (O(1) exact match lookups)
  if (meta.testId) {
    const el = document.querySelector(`[data-testid="${meta.testId}"], [data-test-id="${meta.testId}"], [data-test="${meta.testId}"]`);
    if (el) return el as HTMLElement;
  }
  
  if (meta.id) {
    const el = document.getElementById(meta.id);
    if (el) return el;
  }

  // 2. Collect candidates (CSS Path + Fuzzy Fallbacks)
  const candidates = new Set<Element>();
  
  try {
    const el = document.querySelector(meta.cssPath);
    if (el) candidates.add(el);
  } catch (e) { /* Ignore invalid selectors */ }

  // Add all elements of the same tag
  const tagCandidates = Array.from(document.getElementsByTagName(meta.tagName));
  for (const c of tagCandidates) {
    candidates.add(c);
  }

  // 3. Score all candidates to find the true match
  let bestMatch: HTMLElement | null = null;
  let highestScore = 0;
  
  for (const candidate of candidates) {
    const score = calculateScore(candidate, meta);
    
    let finalScore = score;
    try {
      // If it perfectly matches the structural path, it's highly likely to be the element.
      // We give it a massive 40 point boost so that featureless elements (like SVGs or images
      // with no text, classes, or aria-labels) can still pass the 30 point threshold.
      if (candidate === document.querySelector(meta.cssPath)) {
        finalScore += 40;
      }
    } catch (e) {}

    if (finalScore > highestScore && finalScore >= 30) { 
      highestScore = finalScore;
      bestMatch = candidate as HTMLElement;
    }
  }

  // If we still didn't find anything good, but we have a text match, return that as a last resort
  if (!bestMatch && meta.textContent) {
    for (const candidate of candidates) {
      if (getDirectTextContent(candidate as HTMLElement) === meta.textContent) {
        return candidate as HTMLElement;
      }
    }
  }

  return bestMatch;
}
