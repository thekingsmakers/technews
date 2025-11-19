const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/';

// In development (when running `npm run dev`), we use a relative path for API requests.
// This tells the browser to send the request to the Vite development server.
// The Vite server will then use its `proxy` configuration to forward the request to the backend.
//
// In production (after `npm run build`), we use the full, absolute URL provided by the environment variable,
// as the Vite proxy is not available.
const API_URL = import.meta.env.DEV ? '/api' : `${API_BASE_URL}/api`;

export { API_BASE_URL, API_URL };
