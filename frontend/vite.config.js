import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Hardcoded configuration for simplicity and reliability in a local environment.
const VITE_PORT = 6080;
const API_PORT = 5000;
const API_URL = `http://localhost:${API_PORT}`;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all network interfaces to allow access via IP address.
    host: '0.0.0.0',
    port: VITE_PORT,
    strictPort: true,
    // Proxy API requests (/api) to the backend server.
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true, // Recommended for this setup
        secure: false,      // Backend is http, not https
      },
    },
  },
  // Define a global variable for the frontend code.
  // An empty string makes the browser use relative paths for API calls (e.g., /api/news),
  // which are then correctly intercepted by the proxy above.
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(''),
  },
  preview: {
    host: '0.0.0.0',
    port: VITE_PORT,
  }
});
