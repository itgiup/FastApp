import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Hoặc '0.0.0.0'
    port: 5173,
    allowedHosts: true,
    proxy: {
      "/api": {
        target: "http://host:81",
        changeOrigin: true,
      },
    },
  },
})
