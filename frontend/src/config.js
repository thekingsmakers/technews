const getWindowOrigin = () => {
  if (typeof window === 'undefined' || !window.location) {
    return '';
  }
  return window.location.origin;
};

const normalizeBaseUrl = (value) => {
  if (!value) return '';
  return value.replace(/\/$/, '');
};

const API_BASE_URL = (() => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
  const fallback = getWindowOrigin() || 'http://localhost:5000';
  return normalizeBaseUrl(fromEnv || fallback);
})();

export { API_BASE_URL };

