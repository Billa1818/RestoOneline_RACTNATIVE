// ============================================
// screens/delivery/DeliveryDetails.js
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

export default function DeliveryDetails({ route, navigation }) {
  const { delivery } = route.params;
  const mapRef = useRef(null);
  
  // Position du livreur (simulée - en production, utilisez la géolocalisation réelle)
  const [delivererLocation, setDelivererLocation] = useState({
    latitude: 6.3650,
    longitude: 2.4050,
  });

  // Simuler le mouvement du livreur (optionnel)
  useEffect(() => {
    const interval = setInterval(() => {
      setDelivererLocation(prev => ({
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Centrer la carte sur tous les points
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.fitToCoordinates(
          [
            delivererLocation,
            delivery.pickupCoords,
            delivery.deliveryCoords,
          ],
          {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          }
        );
      }, 500);
    }
  }, []);

  const handleCallClient = () => {
    Linking.openURL(`tel:${delivery.clientPhone}`);
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${delivererLocation.latitude},${delivererLocation.longitude}&destination=${delivery.deliveryCoords.latitude},${delivery.deliveryCoords.longitude}&waypoints=${delivery.pickupCoords.latitude},${delivery.pickupCoords.longitude}`;
    Linking.openURL(url);
  };

  const handleCompleteDelivery = () => {
    Alert.alert(
      'Confirmer la livraison',
      'Voulez-vous marquer cette livraison comme complétée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            Alert.alert('Succès', 'Livraison complétée !', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          },
        },
      ]
    );
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
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Détails de la livraison</Text>
          <Text style={styles.headerSubtitle}>#{delivery.id}</Text>
        </View>
        <TouchableOpacity onPress={handleCallClient} style={styles.callButton}>
          <Ionicons name="call" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Carte */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={styles.map}
            initialRegion={{
              latitude: delivererLocation.latitude,
              longitude: delivererLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* Marker du livreur */}
            <Marker
              coordinate={delivererLocation}
              title="Votre position"
              description="Livreur"
            >
              <View style={styles.delivererMarker}>
                <Ionicons name="bicycle" size={24} color="#fff" />
              </View>
            </Marker>

            {/* Marker du restaurant (pickup) */}
            <Marker
              coordinate={delivery.pickupCoords}
              title="Restaurant"
              description={delivery.pickupAddress}
              pinColor="#FF6B35"
            >
              <View style={styles.pickupMarker}>
                <Ionicons name="restaurant" size={20} color="#fff" />
              </View>
            </Marker>

            {/* Marker de livraison */}
            <Marker
              coordinate={delivery.deliveryCoords}
              title="Destination"
              description={delivery.deliveryAddress}
              pinColor="#4CAF50"
            >
              <View style={styles.deliveryMarker}>
                <Ionicons name="location" size={20} color="#fff" />
              </View>
            </Marker>

            {/* Ligne du trajet */}
            <Polyline
              coordinates={[
                delivererLocation,
                delivery.pickupCoords,
                delivery.deliveryCoords,
              ]}
              strokeColor="#2196F3"
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          </MapView>

          {/* Bouton pour ouvrir Google Maps */}
          <TouchableOpacity style={styles.openMapsButton} onPress={handleOpenMaps}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.openMapsText}>Ouvrir dans Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Informations client */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-circle-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Client</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nom:</Text>
              <Text style={styles.value}>{delivery.clientName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Téléphone:</Text>
              <TouchableOpacity onPress={handleCallClient}>
                <Text style={[styles.value, styles.phoneLink]}>{delivery.clientPhone}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.statusContainer}>
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
          </View>
        </Card>

        {/* Adresses */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Itinéraire</Text>
            </View>
            
            <View style={styles.addressBlock}>
              <View style={styles.addressIconContainer}>
                <View style={styles.addressIcon}>
                  <Ionicons name="home" size={18} color="#FF6B35" />
                </View>
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Récupération</Text>
                <Text style={styles.addressValue}>{delivery.pickupAddress}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.addressBlock}>
              <View style={styles.addressIconContainer}>
                <View style={styles.addressIcon}>
                  <Ionicons name="location" size={18} color="#4CAF50" />
                </View>
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Livraison</Text>
                <Text style={styles.addressValue}>{delivery.deliveryAddress}</Text>
              </View>
            </View>

            <View style={styles.distanceInfo}>
              <Ionicons name="navigate-outline" size={16} color="#2196F3" />
              <Text style={styles.distanceText}>Distance: {delivery.distance}</Text>
            </View>
          </View>
        </Card>

        {/* Commande */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="receipt-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Commande</Text>
            </View>
            
            {delivery.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View style={styles.itemBullet} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}

            <Divider style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total à collecter</Text>
              <Text style={styles.totalValue}>{delivery.total} FCFA</Text>
            </View>
          </View>
        </Card>

        {/* Informations supplémentaires */}
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Informations</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Heure de commande:</Text>
              <Text style={styles.value}>{delivery.timestamp}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Mode de paiement:</Text>
              <Text style={styles.value}>Espèces</Text>
            </View>
          </View>
        </Card>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Boutons d'action fixes en bas */}
      {delivery.status === 'en_route' && (
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.problemButton]}
            onPress={() => Alert.alert('Signaler un problème', 'Fonctionnalité à venir')}
          >
            <Ionicons name="warning-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Problème</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleCompleteDelivery}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Marquer complétée</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  callButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  delivererMarker: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
  },
  pickupMarker: {
    backgroundColor: '#FF6B35',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  deliveryMarker: {
    backgroundColor: '#4CAF50',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  openMapsText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#666',
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  phoneLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressBlock: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addressIconContainer: {
    marginRight: 12,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 19,
    marginVertical: 4,
  },
  distanceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  distanceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2196F3',
    marginLeft: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginRight: 12,
  },
  itemText: {
    fontSize: 13,
    color: '#333',
  },
  divider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  problemButton: {
    backgroundColor: '#F44336',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});