import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for a Chrome MV3 extension.
 *
 * WHY THIS IS DIFFERENT FROM A NORMAL VITE APP:
 * A typical Vite app has one entry point (index.html) and one output bundle.
 * A Chrome extension has THREE separate programs that must be built independently:
 *
 * 1. Popup — a small HTML page with React UI
 * 2. Content Script — JS injected into web pages (NO HTML, no dev server)
 * 3. Service Worker — background JS (NO HTML, no DOM, no React)
 *
 * We use Vite's `build.rollupOptions.input` to specify multiple entry points,
 * and the output goes into `dist/` which Chrome loads as an unpacked extension.
 */
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },

  // CRITICAL: Chrome extensions are loaded from disk, not a web server.
  // Default base is '/' which produces absolute paths like '/assets/popup.js'.
  // We need relative paths like './assets/popup.js' or '../../assets/popup.js'.
  // Empty string tells Vite to use relative paths.
  base: '',

  build: {
    // Output to dist/ — this is what Chrome loads
    outDir: 'dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        // Content script is removed from here; it has its own IIFE build
        popup: resolve(__dirname, 'src/popup/index.html'),
        'service-worker': resolve(__dirname, 'src/background/service-worker.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'service-worker') return 'service-worker.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
