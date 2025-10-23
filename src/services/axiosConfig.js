import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('API_URL:', API_URL);

// Cache simple en mémoire
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
  timeout: 15000, // Timeout de 15 secondes
});

// Intercepteur pour le token et le cache
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Request URL:', config.baseURL + config.url);
    console.log('Token:', token);
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Ne pas mettre en cache les requêtes POST (login, register, etc.)
  if (config.method === 'post' || config.method === 'put' || config.method === 'delete') {
    config.skipCache = true;
  }

  // Vérifier le cache pour les requêtes GET uniquement
  if (config.method === 'get' && !config.skipCache) {
    const cacheKey = config.url + JSON.stringify(config.params || {});
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (cached)',
        headers: {},
        config,
        request: {}
      });
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour les réponses et le cache
api.interceptors.response.use(
  response => {
    // Mettre en cache les réponses GET réussies
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = response.config.url + JSON.stringify(response.config.params || {});
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  error => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Erreur API:', error.response?.data);
    }
    
    // Déconnecter l'utilisateur si le token est invalide
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Fonction pour nettoyer le cache
export const clearCache = () => {
  cache.clear();
};

// Fonction pour invalider une clé de cache spécifique
export const invalidateCache = (url) => {
  for (const key of cache.keys()) {
    if (key.startsWith(url)) {
      cache.delete(key);
    }
  }
};

export default api;