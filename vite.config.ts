
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Since root is src, we point directly to index.scss
        additionalData: `@use "@/index.scss" as *;`
      }
    }
  },
  server: {
    port: 3000,
    strictPort: true,
  }
});
