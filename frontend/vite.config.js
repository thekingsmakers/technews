import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Get configuration from environment variables or use defaults
  const port = parseInt(env.VITE_PORT || '6080', 10);
  const apiHost = env.VITE_API_HOST || 'localhost';
  const apiPort = env.VITE_API_PORT || '5000';
  const host = env.VITE_HOST || '0.0.0.0';
  const isNetwork = env.VITE_NETWORK === 'true';

  const apiUrl = `http://${apiHost}:${apiPort}`;

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
