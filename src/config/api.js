// Dynamic API URL Configuration
// In development: defaults to '' (proxied by Vite to localhost:5000)
// In production, prefer VITE_API_URL and fall back to the deployed backend.
const productionApiUrl = 'https://karan-portfolio-backend-0oeg.onrender.com';
export const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? productionApiUrl : '')).replace(/\/$/, '');

export const apiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};
