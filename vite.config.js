import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // or 'www' if that's your sync folder
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  base: './', // ensures relative asset paths for Android/WebView
});