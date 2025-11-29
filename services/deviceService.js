// services/deviceService.js - Service pour enregistrer/gérer les devices

import api, { handleApiError } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICES_ENDPOINT = '/accounts/devices/';

/**
 * Enregistre ou récupère un device
 * @param {string} deviceUUID - UUID du device
 * @returns {Promise<Object>} Device avec ID numérique
 */
export const registerOrGetDevice = async (deviceUUID) => {
  try {
    // Vérifier si déjà enregistré en local
    const existingDeviceId = await AsyncStorage.getItem('device_numeric_id');
    
    if (existingDeviceId) {
      console.log(' Device existant trouvé localement:', existingDeviceId);
      return { id: parseInt(existingDeviceId), uuid: deviceUUID };
    }

    // Récupérer le device existant du serveur
    console.log(' Récupération du device depuis le serveur:', deviceUUID);
    try {
      const response = await api.get(`${DEVICES_ENDPOINT}${deviceUUID}/`);
      const deviceId = response.data.id;
      
      // Sauvegarder l'ID numérique localement
      await AsyncStorage.setItem('device_numeric_id', String(deviceId));
      
      console.log('Device existant récupéré avec ID:', deviceId);
      return { id: deviceId, uuid: deviceUUID };
    } catch (error) {
      // Si device n'existe pas (404), créer un nouveau
      if (error.response?.status === 404) {
        console.log(' Device non trouvé, création d\'un nouveau:', deviceUUID);
        const createResponse = await api.post(DEVICES_ENDPOINT, {
          device_id: deviceUUID,
          name: 'Mobile Device',
        });

        const deviceId = createResponse.data.id;
        await AsyncStorage.setItem('device_numeric_id', String(deviceId));
        
        console.log('Device créé avec ID:', deviceId);
        return { id: deviceId, uuid: deviceUUID };
      }
      throw error;
    }
  } catch (error) {
    console.error(' Erreur registerOrGetDevice:', error);
    throw handleApiError(error);
  }
};

/**
 * Récupère juste l'ID numérique du device
 * @returns {Promise<number|null>} Device ID ou null
 */
export const getDeviceNumericId = async () => {
  try {
    const id = await AsyncStorage.getItem('device_numeric_id');
    return id ? parseInt(id) : null;
  } catch (error) {
    console.error(' Erreur getDeviceNumericId:', error);
    return null;
  }
};

/**
 * Sauvegarde l'ID numérique du device
 * @param {number|string} id - ID du device
 */
export const saveDeviceNumericId = async (id) => {
  try {
    await AsyncStorage.setItem('device_numeric_id', String(id));
    console.log(' Device numeric ID sauvegardé:', id);
  } catch (error) {
    console.error(' Erreur saveDeviceNumericId:', error);
  }
};

/**
 * Efface l'ID du device (logout)
 */
export const clearDeviceNumericId = async () => {
  try {
    await AsyncStorage.removeItem('device_numeric_id');
    console.log(' Device numeric ID effacé');
  } catch (error) {
    console.error(' Erreur clearDeviceNumericId:', error);
  }
};

export default {
  registerOrGetDevice,
  getDeviceNumericId,
  saveDeviceNumericId,
  clearDeviceNumericId,
};
