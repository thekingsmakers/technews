import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get configuration from environment variables or use defaults
  const port = parseInt(env.VITE_PORT || '6080', 10);
  const apiUrl = env.VITE_API_BASE_URL || 'http://localhost:5000';
  const host = '0.0.0.0'; // Listen on all network interfaces
  const isNetwork = env.VITE_NETWORK === 'true';

  console.log('\n🚀 Frontend Configuration:');
  console.log(`→ Mode: ${mode}`);
  console.log(`→ Port: ${port}`);
  console.log(`→ API URL: ${apiUrl}`);
  console.log(`→ Network Access: ${isNetwork ? 'Enabled' : 'Disabled'}\n`);

  return defineConfig({
    plugins: [react()],
    server: {
      host,
      port,
      strictPort: true,
      open: !isNetwork, // Only open browser in local mode
      cors: true,
      hmr: {
        clientPort: isNetwork ? 80 : 24678, // Use port 80 for network access
        protocol: 'ws',
        host: isNetwork ? host : 'localhost',
        port: 24678
      },
      watch: {
        usePolling: isNetwork, // Enable polling in network mode
        interval: 100
      },
      proxy: {
        '/api': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
        }
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
      }
    },
    preview: {
      host,
      port,
      strictPort: true,
      open: !isNetwork
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiUrl),
    }
  });
};
