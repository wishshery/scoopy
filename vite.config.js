import { defineConfig } from 'vite';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The package is ESM, so __dirname is not defined here.
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Emit `404.html` as a copy of `index.html`.
 *
 * GitHub Pages serves `404.html` for any path it cannot match. This is a
 * single-page site, so every such path should still show the page rather than
 * GitHub's error screen — a shared link that picks up a stray path (a leftover
 * `/scoopy`, a tracking segment appended by an app) then still works.
 */
function serveSiteOnUnknownPaths() {
  return {
    name: 'scoopy:404-fallback',
    apply: 'build',
    async closeBundle() {
      const out = path.resolve(projectRoot, 'dist');
      await copyFile(path.join(out, 'index.html'), path.join(out, '404.html'));
    },
  };
}

/**
 * Vite config.
 *
 * `base` is read from the BASE_PATH env var so the same build works both at a
 * domain root (`/`) and under a GitHub Pages project path (`/<repo>/`).
 */
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [serveSiteOnUnknownPaths()],
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
