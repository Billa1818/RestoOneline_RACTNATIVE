// ============================================
// screens/delivery/DeliveryHistoryDetails.js - Détails d'une livraison terminée
// ============================================
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

export default function DeliveryHistoryDetails({ route, navigation }) {
  const { delivery } = route.params;

  const callCustomer = () => {
    Linking.openURL(`tel:${delivery.customerPhone}`);
  };

  const openMaps = (address) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={20}
            color="#FFB800"
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#495057" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la livraison</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Badge de statut */}
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.statusText}>Livraison terminée</Text>
          <Text style={styles.statusSubtext}>{delivery.completedAt}</Text>
        </View>

        {/* Gains */}
        <Card style={styles.card}>
          <View style={styles.earningsSection}>
            <Text style={styles.sectionTitle}>Vos gains</Text>
            <View style={styles.earningsDetails}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Frais de livraison</Text>
                <Text style={styles.earningsValue}>{delivery.deliveryFee} FCFA</Text>
              </View>
              {delivery.tip > 0 && (
                <View style={styles.earningsRow}>
                  <Text style={styles.earningsLabel}>Pourboire</Text>
                  <Text style={[styles.earningsValue, styles.tipValue]}>
                    +{delivery.tip} FCFA
                  </Text>
                </View>
              )}
              <Divider style={styles.divider} />
              <View style={styles.earningsRow}>
                <Text style={styles.earningsTotalLabel}>Total gagné</Text>
                <Text style={styles.earningsTotalValue}>{delivery.earnings} FCFA</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Évaluation */}
        {delivery.rating && (
          <Card style={styles.card}>
            <View style={styles.ratingSection}>
              <Text style={styles.sectionTitle}>Évaluation du client</Text>
              <View style={styles.ratingContent}>
                {renderStars(delivery.rating)}
                <Text style={styles.ratingScore}>{delivery.rating}/5</Text>
              </View>
              {delivery.customerComment && (
                <View style={styles.commentContainer}>
                  <Ionicons name="chatbox-outline" size={16} color="#868E96" />
                  <Text style={styles.commentText}>{delivery.customerComment}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Informations client */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color="#495057" />
              <Text style={styles.infoText}>{delivery.customerName}</Text>
            </View>
            <TouchableOpacity style={styles.phoneButton} onPress={callCustomer}>
              <Ionicons name="call" size={18} color="#4CAF50" />
              <Text style={styles.phoneText}>{delivery.customerPhone}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Trajets */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Trajet effectué</Text>
          
          {/* Point de départ */}
          <TouchableOpacity
            style={styles.addressBlock}
            onPress={() => openMaps(delivery.pickupAddress)}
          >
            <View style={styles.addressIconContainer}>
              <Ionicons name="restaurant" size={24} color="#4CAF50" />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Récupération</Text>
              <Text style={styles.addressText}>{delivery.pickupAddress}</Text>
            </View>
            <Ionicons name="navigate" size={20} color="#868E96" />
          </TouchableOpacity>

          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
            <View style={styles.routeStats}>
              <View style={styles.routeStat}>
                <Ionicons name="navigate-outline" size={14} color="#868E96" />
                <Text style={styles.routeStatText}>{delivery.distance}</Text>
              </View>
              <View style={styles.routeStat}>
                <Ionicons name="time-outline" size={14} color="#868E96" />
                <Text style={styles.routeStatText}>{delivery.duration}</Text>
              </View>
            </View>
          </View>

          {/* Point d'arrivée */}
          <TouchableOpacity
            style={styles.addressBlock}
            onPress={() => openMaps(delivery.deliveryAddress)}
          >
            <View style={styles.addressIconContainer}>
              <Ionicons name="location" size={24} color="#FF6B35" />
            </View>
            <View style={styles.addressContent}>
              <Text style={styles.addressLabel}>Livraison</Text>
              <Text style={styles.addressText}>{delivery.deliveryAddress}</Text>
            </View>
            <Ionicons name="navigate" size={20} color="#868E96" />
          </TouchableOpacity>
        </Card>

        {/* Articles commandés */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Articles livrés</Text>
          {delivery.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price * item.quantity} FCFA</Text>
            </View>
          ))}
          <Divider style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total commande</Text>
            <Text style={styles.totalValue}>{delivery.total} FCFA</Text>
          </View>
        </Card>

        {/* Informations de livraison */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Informations</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>N° Commande</Text>
              <Text style={styles.infoItemValue}>#{delivery.orderId}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>N° Livraison</Text>
              <Text style={styles.infoItemValue}>#{delivery.id}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Acceptée le</Text>
              <Text style={styles.infoItemValue}>{delivery.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoItemLabel}>Terminée le</Text>
              <Text style={styles.infoItemValue}>{delivery.completedAt}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.bottomPadding} />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  statusBadge: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 12,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#868E96',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  earningsSection: {
    paddingBottom: 4,
  },
  earningsDetails: {
    gap: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: '#868E96',
  },
  earningsValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  tipValue: {
    color: '#4CAF50',
  },
  divider: {
    marginVertical: 8,
  },
  earningsTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  earningsTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  ratingSection: {
    paddingBottom: 4,
  },
  ratingContent: {
    alignItems: 'center',
    gap: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
  },
  commentContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  commentText: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
    fontStyle: 'italic',
  },
  customerInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  phoneText: {
    fontSize: 15,
    color: '#4CAF50',
    fontWeight: '600',
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    color: '#868E96',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  routeConnector: {
    marginLeft: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E9ECEF',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 16,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 12,
    color: '#868E96',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    width: 32,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#495057',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#868E96',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItemLabel: {
    fontSize: 14,
    color: '#868E96',
  },
  infoItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  bottomPadding: {
    height: 32,
  },
});