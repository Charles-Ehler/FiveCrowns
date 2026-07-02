import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this app from https://<user>.github.io/FiveCrowns/,
// so assets must be requested with that base path in production.
export default defineConfig({
  base: '/FiveCrowns/',
  plugins: [react(), tailwindcss()],
});
