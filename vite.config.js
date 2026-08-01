import { defineConfig } from 'vite';

/**
 * Vite config.
 *
 * `base` is read from the BASE_PATH env var so the same build works both at a
 * domain root (`/`) and under a GitHub Pages project path (`/<repo>/`).
 */
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 2048,
    reportCompressedSize: false,
  },
  server: {
    port: 5173,
  },
});
