import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5000,
  },
  preview: {
    port: 8080,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
