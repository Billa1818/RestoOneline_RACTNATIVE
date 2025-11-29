// AuthContext.js - Contexte d'authentification avec support double session

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import UserService from '../services/UserService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'delivery' ou 'client'

  useEffect(() => {
    initializeAuth();
  }, []);

  const generateDeviceId = async () => {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      
      if (!deviceId) {
        const deviceName = Device.deviceName || 'Unknown Device';
        const timestamp = Date.now();
        deviceId = `${Platform.OS}_${deviceName}_${timestamp}`.replace(/\s+/g, '_');
        
        await AsyncStorage.setItem('device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Erreur génération device_id:', error);
      const randomId = `${Platform.OS}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      await AsyncStorage.setItem('device_id', randomId);
      return randomId;
    }
  };

  const getFCMToken = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        return token;
      }

      return null;
    } catch (error) {
      console.error('Erreur obtention FCM token:', error);
      return null;
    }
  };

  /**
   * Sauvegarder la session client avant de passer en mode livreur
   */
  const saveClientSession = async () => {
    try {
      const deviceData = await AsyncStorage.getItem('device_data');
      const deviceId = await AsyncStorage.getItem('device_id');
      
      if (deviceData && deviceId) {
        await AsyncStorage.setItem('client_session_backup', JSON.stringify({
          device_data: deviceData,
          device_id: deviceId,
          timestamp: Date.now()
        }));
        console.log('Session client sauvegardée');
      }
    } catch (error) {
      console.error('Erreur sauvegarde session client:', error);
    }
  };

  /**
   * Restaurer la session client
   */
  const restoreClientSession = async () => {
    try {
      const backup = await AsyncStorage.getItem('client_session_backup');
      
      if (backup) {
        const { device_data, device_id } = JSON.parse(backup);
        
        await AsyncStorage.setItem('device_data', device_data);
        await AsyncStorage.setItem('device_id', device_id);
        
        const deviceObj = JSON.parse(device_data);
        setDevice(deviceObj);
        
        console.log('Session client restaurée');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur restauration session client:', error);
      return false;
    }
  };

  const initializeAuth = async () => {
    try {
      setLoading(true);

      // Vérifier si c'est un livreur connecté
      const token = await AsyncStorage.getItem('access_token');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (token && refreshToken) {
        try {
          const userData = await UserService.getProfile();
          if (userData.user_type === 'delivery') {
            setUser(userData);
            setUserType('delivery');
            setIsAuthenticated(true);
            setLoading(false);
            return;
          } else {
            await logout();
          }
        } catch (error) {
          console.error('Erreur récupération profil livreur:', error);
          await logout();
        }
      }

      // Si pas de livreur, c'est un client
      const deviceId = await generateDeviceId();
      const deviceDataStr = await AsyncStorage.getItem('device_data');
      
      if (deviceDataStr) {
        const deviceData = JSON.parse(deviceDataStr);
        setDevice(deviceData);
        setUserType('client');
        setIsAuthenticated(true);
      } else {
        await registerClientAuto();
      }
    } catch (error) {
      console.error('Erreur initialisation auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerClientAuto = async () => {
    try {
      const deviceId = await generateDeviceId();
      const fcmToken = await getFCMToken();

      const deviceInfo = {
        model: Device.modelName || 'Unknown',
        os: `${Platform.OS} ${Device.osVersion || ''}`,
        brand: Device.brand || 'Unknown',
      };

      const deviceData = {
        device_id: deviceId,
        device_info: deviceInfo,
        device_name: Device.deviceName || `${Platform.OS} Device`,
        fcm_token: fcmToken,
        customer_name: 'Client',
        customer_phone: '',
        customer_email: '',
      };

      const response = await UserService.registerDevice(deviceData);

      await AsyncStorage.setItem('device_id', response.device.device_id);
      await AsyncStorage.setItem('device_data', JSON.stringify(response.device));

      setDevice(response.device);
      setUserType('client');
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      console.error('Erreur enregistrement auto client:', error);
      throw error;
    }
  };

  /**
   * Connexion LIVREUR (sauvegarde automatique de la session client)
   */
  const loginDelivery = async (username, password) => {
    try {
      setLoading(true);
      
      if (!username || !password) {
        throw new Error('Nom d\'utilisateur et mot de passe requis');
      }

      console.log('Tentative de connexion pour:', username);
      
      // Sauvegarder la session client avant la connexion
      await saveClientSession();
      
      const data = await UserService.login(username, password);
      
      console.log('Données reçues du service:', data);

      if (!data || !data.access || !data.refresh || !data.user) {
        // Restaurer la session client en cas d'échec
        await restoreClientSession();
        throw new Error('Données de connexion invalides');
      }

      if (data.user.user_type !== 'delivery') {
        // Restaurer la session client en cas d'échec
        await restoreClientSession();
        throw new Error('Accès refusé. Cette application est réservée aux livreurs.');
      }

      // Les tokens sont déjà sauvegardés dans UserService.login
      console.log('Connexion réussie');

      setUser(data.user);
      setUserType('delivery');
      setIsAuthenticated(true);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erreur login livreur:', {
        message: error.message,
        details: error.response?.data || error
      });
      
      // Restaurer la session client en cas d'erreur
      await restoreClientSession();
      setUserType('client');
      
      // Extraire le message d'erreur
      let errorMessage = 'Erreur de connexion';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error.response?.data || null
      };
    } finally {
      setLoading(false);
    }
  };

  const updateClientInfo = async (customerInfo) => {
    try {
      const deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        throw new Error('Aucun appareil enregistré');
      }

      const updatedDevice = await UserService.updateDeviceInfo(deviceId, customerInfo);
      
      const currentDevice = await AsyncStorage.getItem('device_data');
      const parsedDevice = currentDevice ? JSON.parse(currentDevice) : {};
      const updatedData = { ...parsedDevice, ...customerInfo };
      
      await AsyncStorage.setItem('device_data', JSON.stringify(updatedData));
      setDevice(updatedData);

      return { success: true, device: updatedData };
    } catch (error) {
      console.error('Erreur mise à jour client:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de mise à jour' 
      };
    }
  };

  const toggleDeliveryAvailability = async () => {
    try {
      if (!user || userType !== 'delivery') {
        throw new Error('Utilisateur non autorisé');
      }

      const response = await UserService.toggleAvailability(user.id);
      
      const updatedUser = { ...user, is_available: response.is_available };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      return { success: true, is_available: response.is_available };
    } catch (error) {
      console.error('Erreur toggle disponibilité:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de mise à jour' 
      };
    }
  };

  const refreshDeliveryProfile = async () => {
    try {
      if (userType !== 'delivery') {
        throw new Error('Utilisateur non autorisé');
      }

      const userData = await UserService.getProfile();
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Erreur refresh profil:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de récupération' 
      };
    }
  };

  const getDeliveryStatistics = async () => {
    try {
      if (!user || userType !== 'delivery') {
        throw new Error('Utilisateur non autorisé');
      }

      const stats = await UserService.getDeliveryPersonStatistics(user.id);
      return { success: true, statistics: stats };
    } catch (error) {
      console.error('Erreur statistiques:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de récupération' 
      };
    }
  };

  const getClientOrders = async () => {
    try {
      const deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId || userType !== 'client') {
        throw new Error('Client non identifié');
      }

      const orders = await UserService.getDeviceOrders(deviceId);
      return { success: true, orders };
    } catch (error) {
      console.error('Erreur historique commandes:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de récupération' 
      };
    }
  };

  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      if (userType !== 'delivery') {
        throw new Error('Fonction réservée aux livreurs');
      }

      await UserService.changePassword(oldPassword, newPassword, confirmPassword);
      return { success: true, message: 'Mot de passe modifié avec succès' };
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur de modification' 
      };
    }
  };

  /**
   * Déconnexion avec restauration automatique de la session client
   */
  const logout = useCallback(async () => {
    try {
      if (userType === 'delivery') {
        // Déconnexion livreur
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        setUser(null);
        
        // Restaurer automatiquement la session client
        const restored = await restoreClientSession();
        
        if (restored) {
          setUserType('client');
          setIsAuthenticated(true);
        } else {
          // Si pas de session à restaurer, créer une nouvelle
          await initializeAuth();
        }
      } else if (userType === 'client') {
        setDevice(null);
        setUserType(null);
        setIsAuthenticated(false);
        await initializeAuth();
      }
    } catch (error) {
      console.error('Erreur logout:', error);
    }
  }, [userType]);

  const value = {
    // États
    user,
    device,
    loading,
    isAuthenticated,
    userType,

    // Vérifications de type
    isClient: userType === 'client',
    isDelivery: userType === 'delivery',

    // Méthodes d'authentification
    loginDelivery,
    logout,

    // Méthodes livreur
    toggleDeliveryAvailability,
    refreshDeliveryProfile,
    getDeliveryStatistics,
    changePassword,

    // Méthodes client
    updateClientInfo,
    getClientOrders,

    // Utilitaires
    refreshAuth: initializeAuth,
    saveClientSession,
    restoreClientSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;