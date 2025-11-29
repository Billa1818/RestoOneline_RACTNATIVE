// api.js - Configuration centrale de l'API pour React Native

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// URL de base de l'API - À modifier selon votre environnement
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.186.238:8000/api' // IP locale pour développement
  : 'https://votre-api.com/api'; // Production

// Instance axios configurée
const api = axios.create({  
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 secondes  
});

// URLs qui ne nécessitent pas de refresh token
const NO_REFRESH_URLS = [
  '/accounts/users/login/',
  '/token/refresh/',
  '/accounts/devices/register/',
  '/accounts/users/password_reset_request/',
  '/accounts/users/password_reset_confirm/',
  '/menu/sizes/',
  '/menu/items/',
  '/menu/categories/',
  '/orders/carts/my_cart/',
  '/orders/carts/',
];

// Vérifier si une URL ne doit pas déclencher le refresh
const shouldSkipRefresh = (url) => {
  return NO_REFRESH_URLS.some(noRefreshUrl => url.includes(noRefreshUrl));
};

// Variable pour éviter les multiples tentatives de refresh simultanées
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use( 
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer le rafraîchissement du token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ne pas tenter de refresh sur les URLs exclues
    if (shouldSkipRefresh(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Si l'erreur est 401 et qu'on n'a pas déjà essayé de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si un refresh est déjà en cours, mettre la requête en attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.log('Pas de refresh token disponible');
          throw new Error('No refresh token available');
        }

        console.log('Tentative de refresh du token...');

        // Appeler l'endpoint de refresh
        const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        
        // Sauvegarder le nouveau token
        await AsyncStorage.setItem('access_token', access);

        console.log('Token refreshed avec succès');

        // Mettre à jour l'en-tête Authorization
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        // Traiter la file d'attente
        processQueue(null, access);
        
        isRefreshing = false;

        // Réessayer la requête originale avec le nouveau token
        return api(originalRequest);
      } catch (refreshError) {
        console.log('Échec du refresh token, déconnexion...');
        
        // Traiter la file d'attente avec l'erreur
        processQueue(refreshError, null);
        isRefreshing = false;

        // Si le refresh échoue, déconnecter l'utilisateur
        await handleLogout();
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Déconnexion de l'utilisateur (supprimer les tokens et données)
 */
export const handleLogout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'access_token',
      'refresh_token',
      'user',
      'user_profile'
    ]);
    
    // Réinitialiser l'en-tête Authorization
    delete api.defaults.headers.common['Authorization'];
    
    console.log('Utilisateur déconnecté');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};

/**
 * Fonction helper pour gérer les erreurs API
 * @param {Error} error - Erreur interceptée
 * @returns {Object} Objet avec message d'erreur formaté
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Le serveur a répondu avec un code d'erreur
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          status: 400,
          message: data.error || data.message || data.detail || 'Données invalides',
          details: data,
        };
      case 401:
        return {
          status: 401,
          message: data.detail || data.message || 'Non authentifié. Veuillez vous reconnecter.',
          details: data,
        };
      case 403:
        return {
          status: 403,
          message: data.detail || data.message || 'Accès refusé. Permissions insuffisantes.',
          details: data,
        };
      case 404:
        return {
          status: 404,
          message: data.detail || data.message || 'Ressource non trouvée',
          details: data,
        };
      case 500:
        return {
          status: 500,
          message: 'Erreur serveur. Veuillez réessayer plus tard.',
          details: data,
        };
      default:
        return {
          status: status,
          message: data.error || data.message || data.detail || 'Une erreur est survenue',
          details: data,
        };
    }
  } else if (error.request) {
    // La requête a été faite mais pas de réponse
    return {
      status: null,
      message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      details: null,
    };
  } else {
    // Erreur lors de la configuration de la requête
    return {
      status: null,
      message: error.message || 'Une erreur est survenue',
      details: null,
    };
  }
};

/**
 * Afficher une alerte d'erreur
 * @param {Object} errorInfo - Informations d'erreur retournées par handleApiError
 * @param {string} title - Titre de l'alerte (optionnel)
 */
export const showErrorAlert = (errorInfo, title = 'Erreur') => {
  Alert.alert(
    title,
    errorInfo.message,
    [{ text: 'OK' }],
    { cancelable: true }
  );
};

/**
 * Fonction helper pour créer un FormData pour les requêtes multipart/form-data
 * @param {Object} data - Données à convertir en FormData
 * @returns {FormData} FormData prêt à envoyer
 */
export const createFormDataRequest = (data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      // Gestion des fichiers React Native
      if (data[key]?.uri) {
        formData.append(key, {
          uri: data[key].uri,
          type: data[key].type || 'image/jpeg',
          name: data[key].name || `file_${Date.now()}.jpg`,
        });
      } 
      // Gestion des tableaux et objets
      else if (Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      }
      else if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
        formData.append(key, JSON.stringify(data[key]));
      } 
      // Valeurs simples
      else {
        formData.append(key, data[key]);
      }
    }
  });
  
  return formData;
};

/**
 * Configuration pour les requêtes avec fichiers
 */
export const fileUploadConfig = {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000, // 60 secondes pour l'upload de fichiers
};

/**
 * Vérifier si l'utilisateur est authentifié
 * @returns {Promise<boolean>} True si authentifié
 */
export const isAuthenticated = async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
};

/**
 * Récupérer les informations de l'utilisateur connecté
 * @returns {Promise<Object|null>} Informations utilisateur ou null
 */
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

/**
 * Sauvegarder les informations de l'utilisateur
 * @param {Object} user - Informations utilisateur
 */
export const saveCurrentUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'utilisateur:', error);
  }
};

/**
 * Fonction helper pour effectuer des retry sur les requêtes échouées
 * @param {Function} apiCall - Fonction API à appeler
 * @param {number} maxRetries - Nombre maximum de tentatives
 * @param {number} delay - Délai entre les tentatives (ms)
 * @returns {Promise} Résultat de l'appel API
 */
export const retryApiCall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Ne pas retry sur les erreurs 4xx (erreurs client)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      // Attendre avant de réessayer (sauf à la dernière tentative)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;  
};

// Exporter l'URL de base pour les besoins de construction d'URLs
export const BASE_URL = API_BASE_URL;

export default api;