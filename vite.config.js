import { defineConfig } from 'vite';

export default defineConfig({
  // BASE_PATH is set in CI for GitHub Pages (e.g. /sketchvlada/); locally the site is served from /
  base: process.env.BASE_PATH || '/',
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 }
});
