import axios from 'axios';

// Global backend-offline flag — reactive via listeners
let _backendOffline = false;
const _listeners = new Set();

export function onBackendStatusChange(fn) {
  _listeners.add(fn);
  return () => _listeners.delete(fn);
}

export function isBackendOffline() {
  return _backendOffline;
}

function setBackendOffline(val) {
  if (_backendOffline !== val) {
    _backendOffline = val;
    _listeners.forEach(fn => fn(val));
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8000/api`,
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass ngrok browser warning for free tiers
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

// Response interceptor: handle 401 by refreshing token + detect backend offline
api.interceptors.response.use(
  (response) => {
    // Backend responded — mark it as online
    setBackendOffline(false);
    return response;
  },
  async (error) => {
    // Network error (no response at all) = backend is offline
    if (!error.response) {
      setBackendOffline(true);
      return Promise.reject(error);
    }

    // Got a response — backend is online
    setBackendOffline(false);

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${api.defaults.baseURL}/auth/refresh/`,
            { refresh: refreshToken },
            { headers: { 'ngrok-skip-browser-warning': 'true' } }
          );
          localStorage.setItem('access_token', res.data.access);
          if (res.data.refresh) {
            localStorage.setItem('refresh_token', res.data.refresh);
          }
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.removeItem('access_token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
