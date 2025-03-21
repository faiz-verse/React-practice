import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
//   server: {
//     port: 3000,
//   },
//   preview: {
//     port: 8080,
//   },
  base: '/', // This is crucial for proper routing
});
