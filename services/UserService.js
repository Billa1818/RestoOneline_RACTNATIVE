// UserService.js - Service pour la gestion des utilisateurs (React Native)

import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleApiError } from './api';

const UserService = {
  // ========================================
  // AUTHENTIFICATION
  // ========================================

  /**
   * Connexion utilisateur (Livreur uniquement)
   * @param {string} username - Nom d'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise} Données de connexion avec tokens et infos utilisateur
   */
  login: async (username, password) => {
    try {
      // Supprimer temporairement les anciens tokens pour éviter les tentatives de refresh
      const oldAccessToken = await AsyncStorage.getItem('access_token');
      const oldRefreshToken = await AsyncStorage.getItem('refresh_token');
      const oldUser = await AsyncStorage.getItem('user');
      
      // Nettoyer les tokens existants avant la connexion
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('user');

      const response = await api.post('/accounts/users/login/', {
        username,
        password,
      });

      // Vérifier la structure de la réponse
      if (!response.data) {
        throw new Error('Réponse serveur invalide');
      }

      const { access, refresh, user } = response.data;

      // Vérifier que tous les éléments nécessaires sont présents
      if (!access || !refresh || !user) {
        throw new Error('Données de connexion incomplètes');
      }

      // Sauvegarder les nouveaux tokens et les infos utilisateur
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      return response.data;
    } catch (error) {
      // En cas d'erreur, ne pas restaurer les anciens tokens
      // Laisser l'utilisateur en mode client
      console.error('Erreur lors de la connexion:', error);
      throw handleApiError(error);
    }
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise} Données du profil utilisateur
   */
  getProfile: async () => {
    try {
      const response = await api.get('/accounts/users/me/');
      
      // Mettre à jour les infos utilisateur dans AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Vérifier si l'utilisateur est connecté
   * @returns {Promise<boolean>}
   */
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },

  /**
   * Récupérer l'utilisateur depuis AsyncStorage
   * @returns {Promise<Object|null>}
   */
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // ========================================
  // RÉINITIALISATION DE MOT DE PASSE
  // ========================================

  /**
   * Demander la réinitialisation du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise}
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/accounts/users/password_reset_request/', {
        email,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Confirmer la réinitialisation du mot de passe
   * @param {string} uid - UID de l'utilisateur
   * @param {string} token - Token de réinitialisation
   * @param {string} newPassword - Nouveau mot de passe
   * @param {string} confirmPassword - Confirmation du mot de passe
   * @returns {Promise}
   */
  confirmPasswordReset: async (uid, token, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/accounts/users/password_reset_confirm/', {
        uid,
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Changer le mot de passe (utilisateur connecté)
   * @param {string} oldPassword - Ancien mot de passe
   * @param {string} newPassword - Nouveau mot de passe
   * @param {string} confirmPassword - Confirmation du mot de passe
   * @returns {Promise}
   */
  changePassword: async (oldPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/accounts/users/change_password/', {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========================================
  // GESTION DES LIVREURS
  // ========================================

  /**
   * Basculer la disponibilité d'un livreur
   * @param {number} userId - ID du livreur
   * @returns {Promise}
   */
  toggleAvailability: async (userId) => {
    try {
      const response = await api.post(`/accounts/users/${userId}/toggle_availability/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer tous les livreurs
   * @returns {Promise} Liste des livreurs
   */
  getDeliveryPersons: async () => {
    try {
      const response = await api.get('/accounts/delivery-persons/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les livreurs disponibles
   * @returns {Promise} Liste des livreurs disponibles
   */
  getAvailableDeliveryPersons: async () => {
    try {
      const response = await api.get('/accounts/delivery-persons/available/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les détails d'un livreur
   * @param {number} deliveryPersonId - ID du livreur
   * @returns {Promise} Données du livreur
   */
  getDeliveryPersonById: async (deliveryPersonId) => {
    try {
      const response = await api.get(`/accounts/delivery-persons/${deliveryPersonId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les statistiques d'un livreur
   * @param {number} deliveryPersonId - ID du livreur
   * @returns {Promise} Statistiques du livreur
   */
  getDeliveryPersonStatistics: async (deliveryPersonId) => {
    try {
      const response = await api.get(`/accounts/delivery-persons/${deliveryPersonId}/statistics/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========================================
  // GESTION DES APPAREILS CLIENTS
  // ========================================

  /**
   * Enregistrer un appareil client
   * @param {Object} deviceData - Données de l'appareil
   * @returns {Promise}
   */
  registerDevice: async (deviceData) => {
    try {
      const response = await api.post('/accounts/devices/register/', deviceData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer la liste des appareils
   * @returns {Promise} Liste des appareils
   */
  getDevices: async () => {
    try {
      const response = await api.get('/accounts/devices/');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer les détails d'un appareil
   * @param {string} deviceId - ID de l'appareil
   * @returns {Promise} Données de l'appareil
   */
  getDeviceById: async (deviceId) => {
    try {
      const response = await api.get(`/accounts/devices/${deviceId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Mettre à jour les informations client d'un appareil
   * @param {string} deviceId - ID de l'appareil
   * @param {Object} customerInfo - Informations client
   * @returns {Promise}
   */
  updateDeviceInfo: async (deviceId, customerInfo) => {
    try {
      const response = await api.patch(`/accounts/devices/${deviceId}/update-info/`, customerInfo);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Récupérer l'historique des commandes d'un appareil
   * @param {string} deviceId - ID de l'appareil
   * @returns {Promise} Historique des commandes
   */
  getDeviceOrders: async (deviceId) => {
    try {
      const response = await api.get(`/accounts/devices/${deviceId}/orders/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Mettre à jour un appareil
   * @param {string} deviceId - ID de l'appareil
   * @param {Object} deviceData - Données de l'appareil
   * @returns {Promise}
   */
  updateDevice: async (deviceId, deviceData) => {
    try {
      const response = await api.patch(`/accounts/devices/${deviceId}/`, deviceData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Supprimer un appareil
   * @param {string} deviceId - ID de l'appareil
   * @returns {Promise}
   */
  deleteDevice: async (deviceId) => {
    try {
      const response = await api.delete(`/accounts/devices/${deviceId}/`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // ========================================
  // HELPERS
  // ========================================

  /**
   * Vérifier si l'utilisateur est livreur
   * @returns {Promise<boolean>}
   */
  isDelivery: async () => {
    const user = await UserService.getCurrentUser();
    return user?.user_type === 'delivery';
  },
};

export default UserService;