// Dynamic API URL Configuration
// In development: defaults to '' (proxied by Vite to localhost:5000)
// In production on Vercel: reads VITE_API_URL env var (e.g., https://karan-portfolio.onrender.com)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
