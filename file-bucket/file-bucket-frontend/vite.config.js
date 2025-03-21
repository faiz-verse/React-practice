import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Output folder
  },
  base: '/', // Ensure correct routing for Render
  server: {
    port: process.env.PORT || 5173, // Use environment port
  }
});
