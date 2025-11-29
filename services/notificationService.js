// ============================================
// services/notificationService.js
// Service pour gérer les notifications via l'API
// ============================================
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const notificationService = {
  /**
   * Récupérer mes notifications
   * @param {string} deviceId - ID de l'appareil (optionnel)
   * @returns {Promise<Object>}
   */
  getMyNotifications: async (deviceId = null) => {
    try {
      let url = '/notifications/notifications/my_notifications/';
      if (deviceId) {
        url += `?device_id=${deviceId}`;
      }
      
      const response = await api.get(url);
      console.log(' Notifications récupérées:', response.data.length);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur récupération notifications:', error);
      return {
        success: false,
        error: error.message,
        data: [],
      };
    }
  },

  /**
   * Compter les notifications non lues
   * @param {string} deviceId - ID de l'appareil (optionnel)
   * @returns {Promise<Object>}
   */
  getUnreadCount: async (deviceId = null) => {
    try {
      let url = '/notifications/notifications/unread_count/';
      if (deviceId) {
        url += `?device_id=${deviceId}`;
      }
      
      const response = await api.get(url);
      console.log(' Nombre non lues:', response.data.unread_count);
      return {
        success: true,
        unreadCount: response.data.unread_count,
      };
    } catch (error) {
      console.error(' Erreur comptage notifications:', error);
      return {
        success: false,
        error: error.message,
        unreadCount: 0,
      };
    }
  },

  /**
   * Marquer une notification comme lue
   * @param {number} notificationId - ID de la notification
   * @returns {Promise<Object>}
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(
        `/notifications/notifications/${notificationId}/mark_as_read/`
      );
      console.log(' Notification marquée comme lue:', notificationId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur marquage notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Marquer toutes les notifications comme lues
   * @param {string} deviceId - ID de l'appareil (optionnel)
   * @returns {Promise<Object>}
   */
  markAllAsRead: async (deviceId = null) => {
    try {
      let url = '/notifications/notifications/mark_all_as_read/';
      const config = {};
      if (deviceId) {
        config.params = { device_id: deviceId };
      }
      
      const response = await api.post(url, {}, config);
      console.log(' Toutes les notifications marquées comme lues');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur marquage toutes notifications:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Supprimer les anciennes notifications
   * @returns {Promise<Object>}
   */
  deleteOldNotifications: async () => {
    try {
      const response = await api.delete(
        '/notifications/notifications/delete_old_notifications/'
      );
      console.log(' Anciennes notifications supprimées');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(' Erreur suppression anciennes notifications:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Obtenir le device_id depuis AsyncStorage
   * @returns {Promise<string>}
   */
  getDeviceId: async () => {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error(' Erreur device_id:', error);
      return null;
    }
  },

  /**
   * Mapper le type de notification à l'icône
   * @param {string} type - Type de notification
   * @returns {string}
   */
  getNotificationIcon: (type) => {
    const iconMap = {
      'order_created': 'bag-add',
      'order_accepted': 'checkmark-circle',
      'order_refused': 'close-circle',
      'order_preparing': 'flame',
      'order_ready': 'checkmark-done',
      'order_assigned': 'person',
      'order_picked_up': 'car',
      'order_in_delivery': 'bicycle',
      'order_delivered': 'home',
      'delivery_assigned': 'person-add',
      'delivery_accepted': 'checkmark',
      'delivery_completed': 'checkmark-done',
      'payment_received': 'card',
      'payment_failed': 'alert-circle',
      'rating_received': 'star',
      'account_created': 'person-circle',
    };
    return iconMap[type] || 'notifications';
  },

  /**
   * Mapper le type de notification à la couleur
   * @param {string} type - Type de notification
   * @returns {string}
   */
  getNotificationColor: (type) => {
    const colorMap = {
      'order_created': '#2196F3',
      'order_accepted': '#4CAF50',
      'order_refused': '#F44336',
      'order_preparing': '#FF9800',
      'order_ready': '#4CAF50',
      'order_assigned': '#2196F3',
      'order_picked_up': '#FF9800',
      'order_in_delivery': '#FF9800',
      'order_delivered': '#4CAF50',
      'delivery_assigned': '#2196F3',
      'delivery_accepted': '#4CAF50',
      'delivery_completed': '#4CAF50',
      'payment_received': '#4CAF50',
      'payment_failed': '#F44336',
      'rating_received': '#FFC107',
      'account_created': '#9C27B0',
    };
    return colorMap[type] || '#757575';
  },

  /**
   * Formater la date/heure de la notification
   * @param {string} createdAt - Date ISO
   * @returns {string}
   */
  formatNotificationTime: (createdAt) => {
    try {
      const notifDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - notifDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `${diffMins} min`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}j`;
      
      return notifDate.toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur formatage temps:', error);
      return 'Récent';
    }
  },
};

export default notificationService;
