import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite config for the Content Script.
 * 
 * WHY A SEPARATE CONFIG? (A VERY SENIOR DECISION)
 * Chrome content scripts DO NOT natively support ES module `import` statements
 * in the same way regular web pages do. If Vite chunks React out into a shared
 * `jsx-runtime.js` file, the content script will throw:
 * "Cannot use import statement outside a module"
 * 
 * To fix this robustly without relying on black-box plugins like @crxjs,
 * we build the content script as a standalone IIFE (Immediately Invoked Function Expression).
 * This bundles all dependencies (like React and Zustand) directly into a single `content.js` file.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    // Required to bundle React properly in lib mode
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false, // IMPORTANT: Don't delete the popup/SW build!
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/content/index.ts'),
      name: 'MiniAptyContent',
      formats: ['iife'], // Forces a single file without `import` statements
      fileName: () => 'content.js'
    },
    rollupOptions: {
      // Do NOT externalize React. We want it bundled inside the content script.
      external: []
    }
  }
});
