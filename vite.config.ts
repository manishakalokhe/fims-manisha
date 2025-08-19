import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    global: 'globalThis',
  },
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: mode === 'mobile' ? ['react-native'] : [],
    },
  },
}));
