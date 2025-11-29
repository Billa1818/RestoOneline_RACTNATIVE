// utils/deviceUtils.js - Utilitaires pour gestion du Device ID

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

const DEVICE_ID_KEY = 'app_device_id';
const DEVICE_STORED_KEY = 'device_id'; // Clé API

/**
 * Génère un UUID v4 simple
 * @returns {string} UUID
 */
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Récupère ou crée un device_id unique
 * @returns {Promise<string>} Device ID
 */
export const getOrCreateDeviceId = async () => {
  try {
    // 1. Vérifier si déjà sauvegardé en AsyncStorage
    let deviceId = await AsyncStorage.getItem(DEVICE_STORED_KEY);
    
    if (deviceId) {
      console.log('✅ Device ID trouvé en AsyncStorage:', deviceId);
      return deviceId;
    }

    // 2. Chercher dans l'ancienne clé
    const oldDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (oldDeviceId) {
      console.log('✅ Device ID trouvé (ancienne clé):', oldDeviceId);
      await AsyncStorage.setItem(DEVICE_STORED_KEY, oldDeviceId);
      return oldDeviceId;
    }

    // 3. Générer un nouveau device_id
    const newDeviceId = generateUUID();
    console.log('🆕 Nouveau Device ID généré:', newDeviceId);
    
    // Sauvegarder
    await AsyncStorage.setItem(DEVICE_STORED_KEY, newDeviceId);
    await AsyncStorage.setItem(DEVICE_ID_KEY, newDeviceId);

    return newDeviceId;
  } catch (error) {
    console.error('❌ Erreur getOrCreateDeviceId:', error);
    // Fallback ultime: génerer un ID temporaire
    return generateUUID();
  }
};

/**
 * Récupère juste le device_id sans en créer
 * @returns {Promise<string|null>} Device ID ou null
 */
export const getDeviceId = async () => {
  try {
    return await AsyncStorage.getItem(DEVICE_STORED_KEY);
  } catch (error) {
    console.error('❌ Erreur getDeviceId:', error);
    return null;
  }
};

/**
 * Sauvegarde manuellement un device_id (utile après login)
 * @param {string|number} id - Device ID à sauvegarder
 */
export const saveDeviceId = async (id) => {
  try {
    const idStr = String(id);
    await AsyncStorage.setItem(DEVICE_STORED_KEY, idStr);
    console.log('✅ Device ID sauvegardé:', idStr);
  } catch (error) {
    console.error('❌ Erreur saveDeviceId:', error);
  }
};

/**
 * Obtient des informations sur l'appareil
 * @returns {Promise<Object>} Infos de l'appareil
 */
export const getDeviceInfo = async () => {
  try {
    return {
      deviceId: await getDeviceId(),
      name: Device.deviceName || 'Unknown Device',
      osName: Device.osName,
      osVersion: Device.osVersion,
    };
  } catch (error) {
    console.error('❌ Erreur getDeviceInfo:', error);
    return {
      deviceId: await getDeviceId(),
      name: 'Unknown Device',
    };
  }
};

/**
 * Efface le device_id sauvegardé (logout)
 */
export const clearDeviceId = async () => {
  try {
    await AsyncStorage.removeItem(DEVICE_STORED_KEY);
    console.log('✅ Device ID effacé');
  } catch (error) {
    console.error('❌ Erreur clearDeviceId:', error);
  }
};

export default {
  generateUUID,
  getOrCreateDeviceId,
  getDeviceId,
  saveDeviceId,
  getDeviceInfo,
  clearDeviceId,
};
