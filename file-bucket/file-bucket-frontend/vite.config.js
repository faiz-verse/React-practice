import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder
  },
  base: '/', // Ensure correct routing for Render
  preview: {
    port: process.env.PORT || 4173, // Use environment port
    host: '0.0.0.0',
    allowedHosts: ['.onrender.com']
  }
});
