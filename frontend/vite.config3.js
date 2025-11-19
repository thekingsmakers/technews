import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const port = Number(env.FRONTEND_PORT || 4444);
  const host = env.VITE_HOST || 'localhost';

  return defineConfig({
    plugins: [react()],
    server: {
      host,
      port
    }
  });
};
