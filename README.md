# Mini Apty (Digital Adoption Platform)

A robust, SPA-aware Manifest V3 Chrome Extension designed to record and replay interactive walkthroughs on third-party SaaS applications. 

## 🏗 Architecture & Design Decisions

Building a DAP that overlays onto arbitrary host applications (like GitHub, ChatGPT, or e-commerce sites) is fundamentally a defensive engineering problem. Host apps aggressively mutate their DOM, use obfuscated CSS classes (Tailwind, Styled Components), and rely heavily on asynchronous data fetching.

### 1. Context Isolation (Shadow DOM)
Instead of injecting React directly into the host page's `<body>`, the UI (Author Drawer and Replay Tooltips) is rendered entirely inside an open **Shadow DOM**. 
- **Why:** Prevents global CSS bleed. If a host app has `button { margin: 0 !important; }`, it will not break our extension's UI.

### 2. The Hybrid Targeting Engine (`engine.ts`)
Selectors based purely on `cssPath` (e.g., `body > div > span`) break immediately in SPAs when new elements are mounted. 
- **Solution:** We extract a rich metadata profile (`tagName`, `aria-label`, `textContent`, classes). During replay, we run a **Confidence Scoring Algorithm** that scores candidates. This heavily prefers semantic markers (`data-testid`, `aria-label`) but can fall back to structural patterns if semantic markers are stripped.

### 3. SPA-Aware Replay (Debounced MutationObserver + Polling)
SPAs render asynchronously. If Step 1 clicks a button that triggers a network request to load Step 2, searching the DOM immediately will fail.
- **Implementation (`useElementTracker`):** We attach a debounced `MutationObserver` to `document.body` to instantly react to DOM insertions, backed by a 250ms `setInterval` polling loop to catch visual-only changes (like CSS transitions or `opacity: 1` changes that don't mutate the DOM tree).
- **Memory Safety:** The tracker implements strict cleanup (`observer.disconnect()`, `clearInterval()`) to prevent memory leaks during long-lived SPA sessions.

### 4. State Management (Zustand)
React Context is insufficient because critical extension logic (like the global `capture` event listeners intercepting host clicks) exists outside the React render tree. 
- **Solution:** Zustand provides a decoupled state layer, allowing our DOM-level `click` interceptors to push state changes that React listens to reactively.

### 5. Resilient Storage Layer
`chrome.storage.local` is prone to corruption if the schema evolves. We use **Zod** as a runtime validation boundary. If corrupted data is read from storage, Zod safely discards it rather than crashing the React application.

---

## ⚠️ Known Limitations

1. **Cross-Origin iFrames:** The current implementation cannot traverse into cross-origin `<iframe>` elements (e.g., embedded Stripe forms or Zendesk widgets) due to browser security boundaries. A complete solution requires injecting the content script into `all_frames: true` and utilizing a complex frame-messaging bus.
2. **Deeply Nested Shadow Roots:** Targeting elements inside a host application's closed Shadow DOM is currently unsupported.
3. **Highly Dynamic Text:** If a target relies heavily on generated text (e.g., "Welcome back, [User]!") and lacks `aria-labels` or stable classes, the Confidence Scoring Algorithm may drop below the required threshold.
4. **Extreme DOM Churn:** Applications utilizing heavy virtualization (like rendering 10,000 rows in a grid) may cause the debounced `MutationObserver` to delay reattachment slightly.

---

## 🚀 Future Improvements

If scaling this to a production-grade enterprise product, the following features would be prioritized:

1. **Smarter Selector Ranking:** Implement a machine learning-assisted ranking engine that crowdsources selector failures across all users to auto-heal broken walkthrough steps centrally.
2. **Visual Anchoring Fallback:** For impossible DOMs (like Canvas or WebGL apps), implement computer vision/pixel-matching fallbacks to anchor tooltips.
3. **Analytics & Event Tracking:** Connect the Replay Engine to an event bus to track drop-off rates (e.g., "User abandoned walkthrough at Step 3").
4. **Collaborative Authoring:** Sync the Zustand `authorStore` over WebSockets to allow multiple team members to collaboratively edit walkthrough content in real-time.
5. **Mutation Batching Optimizations:** Further optimize the `MutationObserver` to ignore specific noisy sub-trees (like ad-banners or stock tickers) to preserve CPU cycles on low-end devices.

---

## 🛠 Local Setup & Build Instructions

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Build the extension:
   ```bash
   pnpm build
   ```
   *(Note: The build process uses two separate Vite configs to ensure the Content Script is bundled as a standalone IIFE script, preventing ES Module import errors in Chrome).*
3. Load the extension:
   - Navigate to `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked** and select the `/dist` directory.
