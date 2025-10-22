import { useEffect, useState } from 'react';

/**
 * Hook personnalisé pour debouncer une valeur
 * Utile pour les recherches et les inputs
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes (défaut: 500ms)
 * @returns {any} La valeur debouncée
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Fonction utilitaire pour créer une fonction debouncée
 * @param {Function} func - La fonction à debouncer
 * @param {number} wait - Le délai d'attente en millisecondes
 * @returns {Function} La fonction debouncée
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default useDebounce;
