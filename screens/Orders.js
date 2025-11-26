// ============================================
// screens/Orders.js - Page des Commandes
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { Card, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Orders({ navigation }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const savedOrders = await AsyncStorage.getItem('orders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'preparing': return '#2196F3';
      case 'delivering': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#999';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'preparing': return 'En préparation';
      case 'delivering': return 'En livraison';
      case 'completed': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const mockOrders = orders.length === 0 ? [
    {
      id: '001',
      date: '2024-11-24 14:30',
      items: [
        { name: 'Poulet Yassa', quantity: 2, price: 3500 },
        { name: 'Jus Bissap', quantity: 1, price: 800 },
      ],
      total: 7800,
      status: 'delivering',
      address: 'Cotonou, Akpakpa',
    },
    {
      id: '002',
      date: '2024-11-23 19:15',
      items: [
        { name: 'Riz au Gras', quantity: 1, price: 2500 },
        { name: 'Alloco Poisson', quantity: 1, price: 2000 },
      ],
      total: 4500,
      status: 'completed',
      address: 'Cotonou, Fidjrossè',
    },
    {
      id: '003',
      date: '2024-11-22 12:00',
      items: [
        { name: 'Salade Niçoise', quantity: 3, price: 1500 },
      ],
      total: 4500,
      status: 'completed',
      address: 'Cotonou, Cadjèhoun',
    },
    {
      id: '004',
      date: '2024-11-21 10:45',
      items: [
        { name: 'Akassa Poisson', quantity: 1, price: 2000 },
      ],
      total: 2000,
      status: 'pending',
      address: 'Cotonou, Godomey',
    },
    {
      id: '005',
      date: '2024-11-24 09:15',
      items: [
        { name: 'Brochettes', quantity: 5, price: 500 },
      ],
      total: 2500,
      status: 'preparing',
      address: 'Cotonou, Jonquet',
    },
  ] : orders;

  // Séparer les commandes en deux catégories
  const pendingOrders = mockOrders.filter(
    order => ['pending', 'preparing', 'delivering'].includes(order.status)
  );
  
  const completedOrders = mockOrders.filter(
    order => ['completed', 'cancelled'].includes(order.status)
  );

  const OrderCard = ({ order }) => (
    <Card style={styles.orderCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('OrderDetails', { order })}
      >
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Commande #{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
          <Chip
            style={[
              styles.statusChip,
              { backgroundColor: getStatusColor(order.status) + '20' },
            ]}
            textStyle={{ color: getStatusColor(order.status) }}
          >
            {getStatusText(order.status)}
          </Chip>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderBody}>
          {order.items.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {item.price * item.quantity} FCFA
              </Text>
            </View>
          ))}

          <View style={styles.orderAddress}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.addressText}>{order.address}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.orderFooter}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{order.total} FCFA</Text>
        </View>

        <View style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Voir détails</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Section En Attente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={24} color="#FF9800" />
            <Text style={styles.sectionTitle}>En Attente</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingOrders.length}</Text>
            </View>
          </View>

          {pendingOrders.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#CED4DA" />
              <Text style={styles.emptySectionText}>
                Aucune commande en cours
              </Text>
            </View>
          ) : (
            pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </View>

        {/* Section Livrées */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.sectionTitle}>Livrées</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{completedOrders.length}</Text>
            </View>
          </View>

          {completedOrders.length === 0 ? (
            <View style={styles.emptySection}>
              <Ionicons name="time" size={48} color="#CED4DA" />
              <Text style={styles.emptySectionText}>
                Aucun historique de commande
              </Text>
            </View>
          ) : (
            completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptySection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  emptySectionText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 12,
  },
  orderCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  orderDate: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  divider: {
    marginHorizontal: 16,
  },
  orderBody: {
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#495057',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#868E96',
  },
  orderAddress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#868E96',
    marginLeft: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  detailButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginRight: 4,
  },
});