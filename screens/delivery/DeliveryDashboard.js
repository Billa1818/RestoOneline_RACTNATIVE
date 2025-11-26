// ============================================
// screens/delivery/DeliveryDashboard.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../../components/AdminHeader';

export default function DeliveryDashboard({ navigation }) {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // pending, accepted, completed

  // Données mockées des livraisons
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      clientName: 'Jean Client',
      clientPhone: '97 11 11 11',
      items: ['Poulet Yassa', 'Riz au Gras'],
      total: 6000,
      status: 'pending', // pending, accepted, en_route, livree, refused
      pickupAddress: 'Restaurant Chez Mariam',
      pickupCoords: { latitude: 6.3703, longitude: 2.3912 },
      deliveryAddress: 'Cotonou, Akpakpa',
      deliveryCoords: { latitude: 6.3568, longitude: 2.4287 },
      timestamp: '10:30',
      distance: '2.5 km',
    },
    {
      id: 2,
      clientName: 'Marie Dupont',
      clientPhone: '97 22 22 22',
      items: ['Salade Niçoise', 'Jus Bissap'],
      total: 2300,
      status: 'pending',
      pickupAddress: 'Restaurant Chez Mariam',
      pickupCoords: { latitude: 6.3703, longitude: 2.3912 },
      deliveryAddress: 'Cotonou, Gbégamey',
      deliveryCoords: { latitude: 6.3805, longitude: 2.4165 },
      timestamp: '10:45',
      distance: '1.8 km',
    },
    {
      id: 3,
      clientName: 'Pierre Martin',
      clientPhone: '97 33 33 33',
      items: ['Alloco Poisson'],
      total: 2000,
      status: 'accepted',
      pickupAddress: 'Restaurant Chez Mariam',
      pickupCoords: { latitude: 6.3703, longitude: 2.3912 },
      deliveryAddress: 'Cotonou, Jonquet',
      deliveryCoords: { latitude: 6.3639, longitude: 2.4228 },
      timestamp: '11:00',
      distance: '3.2 km',
    },
  ]);

  const mockDeliveryStats = {
    totalDeliveries: 8,
    completed: 5,
    inProgress: 2,
    earnings: 24500,
    rating: 4.8,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FFC107';
      case 'accepted':
        return '#2196F3';
      case 'en_route':
        return '#9C27B0';
      case 'livree':
        return '#4CAF50';
      case 'refused':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ En attente';
      case 'accepted':
        return '✅ Acceptée';
      case 'en_route':
        return '🚴 En route';
      case 'livree':
        return '✅ Livrée';
      case 'refused':
        return '❌ Refusée';
      default:
        return status;
    }
  };

  const getTabDeliveries = () => {
    switch (activeTab) {
      case 'pending':
        return deliveries.filter(d => d.status === 'pending');
      case 'accepted':
        return deliveries.filter(d => ['accepted', 'en_route'].includes(d.status));
      case 'completed':
        return deliveries.filter(d => d.status === 'livree');
      default:
        return [];
    }
  };

  const handleAcceptDelivery = (delivery) => {
    Alert.alert(
      'Accepter la livraison',
      `Voulez-vous accepter la livraison pour ${delivery.clientName} ?\n\nDistance: ${delivery.distance}\nMontant: ${delivery.total} FCFA`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Accepter',
          style: 'default',
          onPress: () => {
            setDeliveries(prev =>
              prev.map(d =>
                d.id === delivery.id ? { ...d, status: 'accepted' } : d
              )
            );
            Alert.alert('Succès', 'Livraison acceptée avec succès !');
            setActiveTab('accepted');
          },
        },
      ]
    );
  };

  const handleRefuseDelivery = (delivery) => {
    Alert.alert(
      'Refuser la livraison',
      `Êtes-vous sûr de vouloir refuser la livraison pour ${delivery.clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Refuser',
          style: 'destructive',
          onPress: () => {
            setDeliveries(prev =>
              prev.map(d =>
                d.id === delivery.id ? { ...d, status: 'refused' } : d
              )
            );
            Alert.alert('Refusée', 'La livraison a été refusée');
          },
        },
      ]
    );
  };

  const handleViewDetails = (delivery) => {
    navigation.navigate('DeliveryDetails', { delivery });
  };

  const handleStartDelivery = (delivery) => {
    Alert.alert(
      'Commencer la livraison',
      `Démarrer la livraison pour ${delivery.clientName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Commencer',
          onPress: () => {
            setDeliveries(prev =>
              prev.map(d =>
                d.id === delivery.id ? { ...d, status: 'en_route' } : d
              )
            );
            navigation.navigate('DeliveryDetails', { delivery: { ...delivery, status: 'en_route' } });
          },
        },
      ]
    );
  };

  const handleCompleteDelivery = (delivery) => {
    Alert.alert(
      'Livraison complétée',
      `Marquer la livraison pour ${delivery.clientName} comme complétée ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Complétée',
          onPress: () => {
            setDeliveries(prev =>
              prev.map(d =>
                d.id === delivery.id ? { ...d, status: 'livree' } : d
              )
            );
            Alert.alert('Succès', 'Livraison marquée comme complétée');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnecter',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('MainTabs');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AdminHeader
        title="Dashboard Livreur"
        subtitle={currentUser?.name}
        navigation={navigation}
      />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Ionicons name="checkmark-done-circle-outline" size={28} color="#4CAF50" />
              <Text style={styles.statValue}>{mockDeliveryStats.completed}</Text>
              <Text style={styles.statLabel}>Complétées</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Ionicons name="timer-outline" size={28} color="#2196F3" />
              <Text style={styles.statValue}>{mockDeliveryStats.inProgress}</Text>
              <Text style={styles.statLabel}>En cours</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Ionicons name="cash-outline" size={28} color="#FF6B35" />
              <Text style={styles.statValue}>{mockDeliveryStats.earnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statCardContent}>
              <Ionicons name="star" size={28} color="#FFC107" />
              <Text style={styles.statValue}>{mockDeliveryStats.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
          </Card>
        </View>

        <Divider style={styles.divider} />

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
            onPress={() => setActiveTab('pending')}
          >
            <Ionicons
              name="hourglass-outline"
              size={18}
              color={activeTab === 'pending' ? '#FF6B35' : '#999'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'pending' && styles.tabLabelActive,
              ]}
            >
              En attente
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
            onPress={() => setActiveTab('accepted')}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={activeTab === 'accepted' ? '#FF6B35' : '#999'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'accepted' && styles.tabLabelActive,
              ]}
            >
              Acceptées
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={18}
              color={activeTab === 'completed' ? '#FF6B35' : '#999'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'completed' && styles.tabLabelActive,
              ]}
            >
              Complétées
            </Text>
          </TouchableOpacity>
        </View>

        {/* Livraisons */}
        <View style={styles.section}>
          {getTabDeliveries().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bicycle-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === 'pending'
                  ? 'Aucune livraison en attente'
                  : activeTab === 'accepted'
                  ? 'Aucune livraison acceptée'
                  : 'Aucune livraison complétée'}
              </Text>
            </View>
          ) : (
            getTabDeliveries().map((delivery) => (
              <Card key={delivery.id} style={styles.deliveryCard}>
                <View
                  style={[
                    styles.deliveryCardBorder,
                    { borderLeftColor: getStatusColor(delivery.status) },
                  ]}
                >
                  {/* Header */}
                  <View style={styles.deliveryHeader}>
                    <View style={styles.deliveryHeaderInfo}>
                      <Text style={styles.clientName}>{delivery.clientName}</Text>
                      <View style={styles.clientPhone}>
                        <Ionicons name="call-outline" size={12} color="#999" />
                        <Text style={styles.phoneText}>{delivery.clientPhone}</Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(delivery.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(delivery.status) },
                        ]}
                      >
                        {getStatusLabel(delivery.status)}
                      </Text>
                    </View>
                  </View>

                  <Divider style={styles.dividerSmall} />

                  {/* Adresses */}
                  <View style={styles.addressesContainer}>
                    <View style={styles.addressRow}>
                      <Ionicons name="home-outline" size={14} color="#FF6B35" />
                      <Text style={styles.addressLabel}>Récupération:</Text>
                      <Text style={styles.addressText} numberOfLines={1}>
                        {delivery.pickupAddress}
                      </Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="location-outline" size={14} color="#4CAF50" />
                      <Text style={styles.addressLabel}>Livraison:</Text>
                      <Text style={styles.addressText} numberOfLines={1}>
                        {delivery.deliveryAddress}
                      </Text>
                    </View>
                    <View style={styles.addressRow}>
                      <Ionicons name="navigate-outline" size={14} color="#2196F3" />
                      <Text style={styles.distanceText}>{delivery.distance}</Text>
                    </View>
                  </View>

                  {/* Articles */}
                  <View style={styles.itemsContainer}>
                    <Text style={styles.itemsTitle}>Articles:</Text>
                    {delivery.items.map((item, index) => (
                      <Text key={index} style={styles.itemText}>
                        • {item}
                      </Text>
                    ))}
                  </View>

                  <Divider style={styles.dividerSmall} />

                  {/* Footer avec actions */}
                  <View style={styles.deliveryFooter}>
                    <Text style={styles.deliveryTotal}>{delivery.total} FCFA</Text>
                    
                    {/* Boutons d'action selon le statut */}
                    <View style={styles.actionButtonsContainer}>
                      {delivery.status === 'pending' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.refuseButton]}
                            onPress={() => handleRefuseDelivery(delivery)}
                          >
                            <Ionicons name="close-circle" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Refuser</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.acceptButton]}
                            onPress={() => handleAcceptDelivery(delivery)}
                          >
                            <Ionicons name="checkmark-circle" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Accepter</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      
                      {delivery.status === 'accepted' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.detailsButton]}
                            onPress={() => handleViewDetails(delivery)}
                          >
                            <Ionicons name="map-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Voir</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.startButton]}
                            onPress={() => handleStartDelivery(delivery)}
                          >
                            <Ionicons name="navigate-circle" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Démarrer</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      
                      {delivery.status === 'en_route' && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.detailsButton]}
                            onPress={() => handleViewDetails(delivery)}
                          >
                            <Ionicons name="map-outline" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Carte</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.completeButton]}
                            onPress={() => handleCompleteDelivery(delivery)}
                          >
                            <Ionicons name="checkmark-done-circle" size={16} color="#fff" />
                            <Text style={styles.actionButtonText}>Terminer</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      
                      {delivery.status === 'livree' && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.detailsButton]}
                          onPress={() => handleViewDetails(delivery)}
                        >
                          <Ionicons name="eye-outline" size={16} color="#fff" />
                          <Text style={styles.actionButtonText}>Détails</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
  },
  divider: {
    marginVertical: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#FFF5F0',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999',
    marginLeft: 6,
  },
  tabLabelActive: {
    color: '#FF6B35',
  },
  section: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
  deliveryCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  deliveryCardBorder: {
    borderLeftWidth: 4,
    padding: 16,
  },
  deliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  deliveryHeaderInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  clientPhone: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dividerSmall: {
    marginVertical: 8,
  },
  addressesContainer: {
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  addressLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
    width: 80,
  },
  addressText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 6,
  },
  itemsContainer: {
    marginBottom: 8,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  deliveryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  deliveryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  refuseButton: {
    backgroundColor: '#F44336',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  detailsButton: {
    backgroundColor: '#9C27B0',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});