// ============================================
// components/Notification.js
// Composant de notifications avec API réelle
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotification } from '../context/NotificationContext';

export default function Notification() {
  const {
    notifications,
    unreadCount,
    loading,
    markNotificationAsRead,
    markAllAsRead,
    clearAllNotifications,
    removeNotification,
    refresh,
  } = useNotification();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
  };

  const handleDeleteNotification = (notificationId) => {
    removeNotification(notificationId);
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
          onPress: async () => {
            await clearAllNotifications();
            setModalVisible(false);
          },
        },
      ]
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const renderNotificationItem = ({ item }) => (
    <Pressable
      style={[
        styles.notificationItem,
        !item.is_read && styles.notificationItemUnread,
      ]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View
        style={[
          styles.notificationIcon,
          { backgroundColor: item.color + '20' },
        ]}
      >
        <Ionicons
          name={item.icon || 'notifications'}
          size={24}
          color={item.color || '#757575'}
        />
      </View>

      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            !item.is_read && styles.notificationTitleBold,
          ]}
        >
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.notificationMeta}>
          <Text style={styles.notificationTime}>{item.timestamp}</Text>
          {item.order_id && (
            <Text style={styles.notificationOrderId}>
              Commande #{item.order_id}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.notificationActions}>
        {!item.is_read && <View style={styles.unreadDot} />}
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
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
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
                  {unreadCount} non lue{unreadCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.headerActions}>
                {unreadCount > 0 && (
                  <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    style={styles.markAllButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="checkmark-done"
                      size={20}
                      color="#5D0EC0"
                    />
                  </TouchableOpacity>
                )}
                {notifications.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearAll}
                    style={styles.clearButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#5D0EC0" />
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

            {loading && !notifications.length ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#5D0EC0" />
                <Text style={styles.loadingText}>Chargement...</Text>
              </View>
            ) : notifications.length === 0 ? (
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
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
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
    backgroundColor: '#5D0EC0',
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
    maxHeight: '85%',
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
  markAllButton: {
    padding: 8,
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
    borderLeftColor: '#5D0EC0',
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
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTime: {
    fontSize: 12,
    color: '#CED4DA',
  },
  notificationOrderId: {
    fontSize: 11,
    color: '#5D0EC0',
    fontWeight: '600',
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
    backgroundColor: '#5D0EC0',
  },
  deleteButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
