import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.FRONTEND_PORT || 4444);

  return defineConfig({
    plugins: [react()],
    server: {
      port
    }
  });
};
