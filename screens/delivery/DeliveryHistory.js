// ============================================
// screens/delivery/DeliveryHistory.js - Historique des livraisons
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Chip, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminHeader from '../../components/AdminHeader';

export default function DeliveryHistory({ navigation }) {
  const [deliveries, setDeliveries] = useState([]);
  const [filter, setFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    loadDeliveryHistory();
  }, []);

  const loadDeliveryHistory = async () => {
    try {
      const savedDeliveries = await AsyncStorage.getItem('deliveryHistory');
      if (savedDeliveries) {
        setDeliveries(JSON.parse(savedDeliveries));
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  // Données de démonstration
  const mockDeliveries = deliveries.length === 0 ? [
    {
      id: 'DEL001',
      orderId: '001',
      date: '2024-11-26 14:30',
      completedAt: '2024-11-26 15:15',
      customerName: 'Kofi Mensah',
      customerPhone: '+229 97 12 34 56',
      pickupAddress: 'Restaurant Le Délice, Akpakpa',
      deliveryAddress: 'Immeuble Azalaï, Fidjrossè',
      distance: '3.2 km',
      duration: '45 min',
      items: [
        { name: 'Poulet Yassa', quantity: 2, price: 3500 },
        { name: 'Jus Bissap', quantity: 1, price: 800 },
      ],
      total: 7800,
      deliveryFee: 1000,
      tip: 500,
      earnings: 1500,
      status: 'completed',
      rating: 5,
      customerComment: 'Livraison rapide, merci !',
    },
    {
      id: 'DEL002',
      orderId: '002',
      date: '2024-11-26 12:00',
      completedAt: '2024-11-26 12:40',
      customerName: 'Aminata Diallo',
      customerPhone: '+229 96 23 45 67',
      pickupAddress: 'Chez Maman Béni, Cadjèhoun',
      deliveryAddress: 'Carré 1450, Godomey',
      distance: '5.8 km',
      duration: '40 min',
      items: [
        { name: 'Riz au Gras', quantity: 1, price: 2500 },
        { name: 'Alloco Poisson', quantity: 1, price: 2000 },
      ],
      total: 4500,
      deliveryFee: 1500,
      tip: 0,
      earnings: 1500,
      status: 'completed',
      rating: 4,
    },
    {
      id: 'DEL003',
      orderId: '003',
      date: '2024-11-25 19:15',
      completedAt: '2024-11-25 20:00',
      customerName: 'Jean-Paul Akpo',
      customerPhone: '+229 94 34 56 78',
      pickupAddress: 'Restaurant Chez Papa, Jonquet',
      deliveryAddress: 'Résidence Les Palmiers, Akpakpa',
      distance: '2.5 km',
      duration: '45 min',
      items: [
        { name: 'Brochettes', quantity: 5, price: 500 },
        { name: 'Salade', quantity: 1, price: 1500 },
      ],
      total: 4000,
      deliveryFee: 800,
      tip: 200,
      earnings: 1000,
      status: 'completed',
      rating: 5,
      customerComment: 'Excellent service !',
    },
    {
      id: 'DEL004',
      orderId: '004',
      date: '2024-11-25 15:30',
      completedAt: '2024-11-25 16:20',
      customerName: 'Marie Koudou',
      customerPhone: '+229 95 45 67 89',
      pickupAddress: 'Le Bon Plat, Cotonou Centre',
      deliveryAddress: 'Stade de l\'Amitié, Kouhounou',
      distance: '4.1 km',
      duration: '50 min',
      items: [
        { name: 'Akassa Poisson', quantity: 2, price: 2000 },
      ],
      total: 4000,
      deliveryFee: 1200,
      tip: 300,
      earnings: 1500,
      status: 'completed',
      rating: 4,
    },
    {
      id: 'DEL005',
      orderId: '005',
      date: '2024-11-24 18:45',
      completedAt: '2024-11-24 19:30',
      customerName: 'Ibrahim Sanni',
      customerPhone: '+229 97 56 78 90',
      pickupAddress: 'Fast Food Central, Haie Vive',
      deliveryAddress: 'Quartier Zogbo, Abomey-Calavi',
      distance: '6.3 km',
      duration: '45 min',
      items: [
        { name: 'Pizza Margherita', quantity: 1, price: 5000 },
        { name: 'Coca Cola', quantity: 2, price: 500 },
      ],
      total: 6000,
      deliveryFee: 1800,
      tip: 500,
      earnings: 2300,
      status: 'completed',
      rating: 5,
    },
  ] : deliveries;

  // Filtrage des livraisons
  const getFilteredDeliveries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return mockDeliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.date);
      
      switch (filter) {
        case 'today':
          return deliveryDate >= today;
        case 'week':
          return deliveryDate >= weekAgo;
        case 'month':
          return deliveryDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredDeliveries = getFilteredDeliveries();

  // Calcul des statistiques
  const totalEarnings = filteredDeliveries.reduce((sum, d) => sum + d.earnings, 0);
  const totalDeliveries = filteredDeliveries.length;
  const totalDistance = filteredDeliveries.reduce((sum, d) => sum + parseFloat(d.distance), 0);
  const averageRating = filteredDeliveries.length > 0
    ? (filteredDeliveries.reduce((sum, d) => sum + (d.rating || 0), 0) / filteredDeliveries.length).toFixed(1)
    : 0;

  const DeliveryCard = ({ delivery }) => (
    <Card style={styles.deliveryCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('DeliveryHistoryDetails', { delivery })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.deliveryId}>#{delivery.id}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={styles.ratingText}>{delivery.rating || '-'}</Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <Text style={styles.earningsAmount}>+{delivery.earnings} FCFA</Text>
            <Text style={styles.deliveryDate}>{delivery.date}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color="#868E96" />
            <Text style={styles.infoText}>{delivery.customerName}</Text>
          </View>

          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <Ionicons name="restaurant" size={16} color="#4CAF50" />
              <Text style={styles.addressText} numberOfLines={1}>
                {delivery.pickupAddress}
              </Text>
            </View>
            <View style={styles.addressConnector} />
            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color="#FF6B35" />
              <Text style={styles.addressText} numberOfLines={1}>
                {delivery.deliveryAddress}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="navigate" size={14} color="#868E96" />
              <Text style={styles.statText}>{delivery.distance}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time" size={14} color="#868E96" />
              <Text style={styles.statText}>{delivery.duration}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="cash" size={14} color="#868E96" />
              <Text style={styles.statText}>{delivery.total} FCFA</Text>
            </View>
          </View>

          {delivery.tip > 0 && (
            <View style={styles.tipBadge}>
              <Ionicons name="gift" size={12} color="#4CAF50" />
              <Text style={styles.tipText}>Pourboire: {delivery.tip} FCFA</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.detailButtonText}>Voir détails</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>

        <AdminHeader
            navigation={navigation}
        />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
      </View>

      {/* Statistiques */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalEarnings} FCFA</Text>
          <Text style={styles.statLabel}>Gains</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalDeliveries}</Text>
          <Text style={styles.statLabel}>Livraisons</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalDistance.toFixed(1)} km</Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.ratingValue}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.statValue}>{averageRating}</Text>
          </View>
          <Text style={styles.statLabel}>Note moy.</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              Tout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'today' && styles.filterButtonActive]}
            onPress={() => setFilter('today')}
          >
            <Text style={[styles.filterText, filter === 'today' && styles.filterTextActive]}>
              Aujourd'hui
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'week' && styles.filterButtonActive]}
            onPress={() => setFilter('week')}
          >
            <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
              Cette semaine
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'month' && styles.filterButtonActive]}
            onPress={() => setFilter('month')}
          >
            <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
              Ce mois
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Liste des livraisons */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {filteredDeliveries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color="#CED4DA" />
            <Text style={styles.emptyStateTitle}>Aucune livraison</Text>
            <Text style={styles.emptyStateText}>
              Aucune livraison pour cette période
            </Text>
          </View>
        ) : (
          filteredDeliveries.map((delivery) => (
            <DeliveryCard key={delivery.id} delivery={delivery} />
          ))
        )}
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
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  ratingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#868E96',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filterText: {
    fontSize: 14,
    color: '#868E96',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  deliveryCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  deliveryId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#868E96',
    fontWeight: '500',
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  deliveryDate: {
    fontSize: 11,
    color: '#868E96',
    marginTop: 4,
  },
  divider: {
    marginHorizontal: 16,
  },
  cardBody: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressConnector: {
    width: 2,
    height: 12,
    backgroundColor: '#E9ECEF',
    marginLeft: 7,
    marginVertical: 4,
  },
  addressText: {
    fontSize: 13,
    color: '#868E96',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#868E96',
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cardFooter: {
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 8,
  },
});