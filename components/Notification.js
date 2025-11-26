// ============================================
// components/Notification.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Données simulées de notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Commande confirmée',
    message: 'Votre commande #12345 a été confirmée',
    type: 'success',
    icon: 'checkmark-circle',
    timestamp: '2 min',
    read: false,
  },
  {
    id: 2,
    title: 'En préparation',
    message: 'Votre plat Poulet Yassa est en préparation',
    type: 'info',
    icon: 'time',
    timestamp: '10 min',
    read: false,
  },
  {
    id: 3,
    title: 'Promo disponible',
    message: 'Obtenez 20% de réduction sur les desserts !',
    type: 'promo',
    icon: 'gift',
    timestamp: '1 heure',
    read: true,
  },
  {
    id: 4,
    title: 'Livraison en cours',
    message: 'Votre commande arrive dans 15 min',
    type: 'delivery',
    icon: 'bicycle',
    timestamp: '2 heures',
    read: true,
  },
  {
    id: 5,
    title: 'Avis client',
    message: 'Comment avez-vous trouvé votre commande ?',
    type: 'feedback',
    icon: 'star',
    timestamp: '3 heures',
    read: true,
  },
];

export default function Notification() {
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'info':
        return '#2196F3';
      case 'promo':
        return '#FF6B35';
      case 'delivery':
        return '#FF9800';
      case 'feedback':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(
      notifications.filter((notif) => notif.id !== notificationId)
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Effacer toutes les notifications',
      'Êtes-vous sûr de vouloir supprimer toutes les notifications ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const renderNotificationItem = ({ item }) => (
    <Pressable
      style={[
        styles.notificationItem,
        !item.read && styles.notificationItemUnread,
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: getNotificationColor(item.type) + '20' },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={24}
          color={getNotificationColor(item.type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            !item.read && styles.notificationTitleBold,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>

      <View style={styles.notificationActions}>
        {!item.read && (
          <View style={styles.unreadDot} />
        )}
        <TouchableOpacity
          onPress={() => handleDeleteNotification(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="close" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </Pressable>
  );

  return (
    <>
      {/* Bouton Notification */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="notifications-outline" size={24} color="#495057" />
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal Notifications */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Notifications</Text>
                <Text style={styles.modalSubtitle}>
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.headerActions}>
                {notifications.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    style={styles.clearButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF6B35" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={28} color="#495057" />
                </TouchableOpacity>
              </View>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off-outline"
                  size={64}
                  color="#CED4DA"
                />
                <Text style={styles.emptyText}>Aucune notification</Text>
                <Text style={styles.emptySubtext}>
                  Vous êtes à jour avec toutes vos notifications
                </Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.notificationsList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginLeft: 8,
  },
  unreadBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B35',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    padding: 8,
  },
  closeButton: {
    padding: 4,
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notificationItemUnread: {
    backgroundColor: '#FFF5F0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  notificationTitleBold: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: '#ADB5BD',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#CED4DA',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 8,
    textAlign: 'center',
  },
});
