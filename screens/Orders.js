// ============================================
// screens/Orders.js - Liste des commandes
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as orderService from '../services/orderService';

export default function Orders({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, delivered, cancelled

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let result = [];

      try {
        if (filter === 'all') {
          console.log('📱 Chargement: Toutes les commandes');
          result = await orderService.getOrders();
          console.log('✅ Réponse getOrders:', result);
        } else if (filter === 'active') {
          console.log('📱 Chargement: Commandes actives');
          result = await orderService.getActiveOrders();
        } else if (filter === 'delivered') {
          console.log('📱 Chargement: Commandes livrées');
          result = await orderService.getOrders({ status: 'delivered' });
        } else if (filter === 'cancelled') {
          console.log('📱 Chargement: Commandes annulées');
          result = await orderService.getOrders({ status: 'cancelled' });
        }
      } catch (apiError) {
        console.error('❌ Erreur API:', apiError);
        // Si erreur, essayer une liste vide plutôt que crasher
        result = [];
      }

      // Assurer que result est un array
      const ordersArray = Array.isArray(result) ? result : [];
      setOrders(ordersArray);
      console.log('✅ Commandes affichées:', ordersArray.length);
    } catch (error) {
      console.error('❌ Erreur générale:', error);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      accepted: '#2196F3',
      preparing: '#9C27B0',
      ready: '#4CAF50',
      assigned: '#03A9F4',
      in_delivery: '#FF5722',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      refused: '#F44336',
    };
    return colors[status] || '#757575';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: 'time-outline',
      accepted: 'checkmark-circle-outline',
      preparing: 'flame-outline',
      ready: 'checkmark-done-outline',
      assigned: 'person-outline',
      in_delivery: 'bicycle-outline',
      delivered: 'home-outline',
      cancelled: 'close-circle-outline',
      refused: 'close-circle-outline',
    };
    return icons[status] || 'help-circle-outline';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderCard = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.order_number })}
      activeOpacity={0.8}
    >
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          {/* Header: Numéro et Statut */}
          <View style={styles.header}>
            <View style={styles.orderNumber}>
              <Text style={styles.orderNumberText}>{item.order_number}</Text>
              <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            </View>
            <Chip
              icon={getStatusIcon(item.status)}
              style={{
                backgroundColor: getStatusColor(item.status) + '20',
              }}
              textStyle={{ color: getStatusColor(item.status), fontSize: 12 }}
            >
              {item.status_display}
            </Chip>
          </View>

          {/* Client Info */}
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.infoText}>{item.customer_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call" size={16} color="#666" />
              <Text style={styles.infoText}>{item.customer_phone}</Text>
            </View>
          </View>

          {/* Items Count */}
          <View style={styles.itemsSection}>
            <Ionicons name="bag" size={16} color="#5D0EC0" />
            <Text style={styles.itemsText}>
              {item.items_count} article{item.items_count > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Total Price */}
          <View style={styles.footer}>
            <View>
              <Text style={styles.totalLabel}>Montant total</Text>
              <Text style={styles.totalPrice}>{parseFloat(item.total).toFixed(0)} FCFA</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#5D0EC0" />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading && !orders.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#5D0EC0" />
          <Text style={styles.loadingText}>Chargement des commandes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filtres */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'active', label: 'En cours' },
          { key: 'delivered', label: 'Livrées' },
          { key: 'cancelled', label: 'Annulées' },
        ].map(f => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterButton,
              filter === f.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f.key && styles.filterButtonTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste des commandes */}
      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={64} color="#DDD" />
          <Text style={styles.emptyText}>Aucune commande</Text>
          <Text style={styles.emptySubtext}>
            Vous n'avez {filter === 'all' ? 'aucune' : `aucune commande ${filter}`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#5D0EC0',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    flex: 1,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  itemsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  itemsText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#5D0EC0',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D0EC0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
