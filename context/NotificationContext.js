// ============================================
// context/NotificationContext.js
// Gestion des notifications avec API en temps réel
// ============================================
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import notificationService from '../services/notificationService';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Initialiser et récupérer le device_id
  useEffect(() => {
    const initializeDeviceId = async () => {
      const id = await notificationService.getDeviceId();
      setDeviceId(id);
    };
    initializeDeviceId();
  }, []);

  /**
   * Charger les notifications
   */
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      
      const result = await notificationService.getMyNotifications(deviceId);
      
      if (result.success) {
        // Formater les notifications
        const formattedNotifications = result.data.map(notif => ({
          ...notif,
          icon: notificationService.getNotificationIcon(notif.type),
          color: notificationService.getNotificationColor(notif.type),
          timestamp: notificationService.formatNotificationTime(notif.created_at),
        }));
        
        setNotifications(formattedNotifications);
        
        // Compter les non lues
        const unreadNotifications = formattedNotifications.filter(n => !n.is_read);
        setUnreadCount(unreadNotifications.length);
        
        console.log('📱 Notifications chargées:', formattedNotifications.length);
      }
      
      setLastRefresh(new Date());
    } catch (error) {
      console.error('❌ Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  /**
   * Récupérer le nombre de notifications non lues
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount(deviceId);
      if (result.success) {
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('❌ Erreur comptage non lues:', error);
    }
  }, [deviceId]);

  /**
   * Marquer une notification comme lue
   */
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      // Mettre à jour localement
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );

      // Mettre à jour le compteur
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Appeler l'API
      const result = await notificationService.markAsRead(notificationId);
      
      if (!result.success) {
        console.error('⚠️ Erreur mise à jour serveur:', result.error);
        // Recharger pour synchroniser
        await loadNotifications();
      }
    } catch (error) {
      console.error('❌ Erreur marquage comme lue:', error);
    }
  }, [loadNotifications]);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // Mettre à jour localement
      const now = new Date().toISOString();
      setNotifications(prev =>
        prev.map(notif => ({
          ...notif,
          is_read: true,
          read_at: now,
        }))
      );

      setUnreadCount(0);

      // Appeler l'API
      const result = await notificationService.markAllAsRead(deviceId);
      
      if (!result.success) {
        console.error('⚠️ Erreur mise à jour serveur:', result.error);
        // Recharger pour synchroniser
        await loadNotifications();
      }
    } catch (error) {
      console.error('❌ Erreur marquage toutes comme lues:', error);
    }
  }, [deviceId, loadNotifications]);

  /**
   * Supprimer une notification localement
   */
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  /**
   * Vider toutes les notifications
   */
  const clearAllNotifications = useCallback(async () => {
    try {
      setNotifications([]);
      setUnreadCount(0);

      // Marquer toutes comme lues avant de les supprimer
      await notificationService.deleteOldNotifications();
    } catch (error) {
      console.error('❌ Erreur suppression notifications:', error);
    }
  }, []);

  /**
   * Ajouter une notification (pour les mises à jour en temps réel)
   */
  const addNotification = useCallback((notification) => {
    const formattedNotif = {
      ...notification,
      icon: notificationService.getNotificationIcon(notification.type),
      color: notificationService.getNotificationColor(notification.type),
      timestamp: notificationService.formatNotificationTime(notification.created_at),
    };

    setNotifications(prev => [formattedNotif, ...prev]);
    
    if (!notification.is_read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  /**
   * Rafraîchir les notifications
   */
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Charger les notifications au montage
  useEffect(() => {
    if (deviceId) {
      loadNotifications();
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [deviceId, loadNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    deviceId,
    lastRefresh,
    loadNotifications,
    fetchUnreadCount,
    markNotificationAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addNotification,
    refresh,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
