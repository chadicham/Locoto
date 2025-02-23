// src/services/axiosConfig.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api`, 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Ajout de l'intercepteur pour le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour les erreurs
api.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;