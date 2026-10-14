import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: true, // Listen on all local IPs
  },
  build: {
    assetsInlineLimit: 0, // ensure assets are kept separate
    outDir: 'dist',
  },
  publicDir: 'public',
});
