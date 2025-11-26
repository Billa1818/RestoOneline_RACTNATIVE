// ============================================
// screens/OrderDetails.js - Détails de commande (Multi-plateforme)
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Divider, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import conditionnel de react-native-maps uniquement pour mobile
let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.log('Maps not available');
  }
}

export default function OrderDetails({ route, navigation }) {
  const { order } = route.params;
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingType, setRatingType] = useState(''); // 'meal' or 'delivery'
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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

  const timeline = [
    { label: 'Commande reçue', time: '14:30', completed: true },
    { label: 'En préparation', time: '14:35', completed: true },
    { label: 'En livraison', time: '15:00', completed: order.status === 'delivering' },
    { label: 'Livré', time: '15:20', completed: order.status === 'completed' },
  ];

  const openRatingModal = (type) => {
    setRatingType(type);
    setRating(0);
    setComment('');
    setShowRatingModal(true);
  };

  const submitRating = () => {
    // Logique pour sauvegarder la notation
    console.log('Rating:', rating, 'Comment:', comment, 'Type:', ratingType);
    setShowRatingModal(false);
  };

  // Composant de carte pour mobile uniquement
  const DeliveryMap = () => {
    if (Platform.OS === 'web' || !MapView) {
      return null;
    }

    return (
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Localisation du livreur</Text>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 6.3703,
              longitude: 2.3912,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: 6.3703, longitude: 2.3912 }}
              title="Livreur"
              description="En route"
            >
              <View style={styles.markerContainer}>
                <Ionicons name="bicycle" size={24} color="#FF6B35" />
              </View>
            </Marker>
            <Marker
              coordinate={{ latitude: 6.3723, longitude: 2.3932 }}
              title="Votre position"
              pinColor="#4CAF50"
            />
          </MapView>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#495057" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la commande</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View
            style={[
              styles.statusBanner,
              { backgroundColor: getStatusColor(order.status) },
            ]}
          >
            <Ionicons name="checkmark-circle" size={40} color="#fff" />
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>

          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Commande #{order.id}</Text>
            <Text style={styles.orderDate}>{order.date}</Text>
          </View>
        </Card>

        {/* Timeline */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Suivi de commande</Text>
            <View style={styles.timeline}>
              {timeline.map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View
                      style={[
                        styles.timelineDot,
                        step.completed && styles.timelineDotCompleted,
                      ]}
                    >
                      {step.completed && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    {index < timeline.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          step.completed && styles.timelineLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      style={[
                        styles.timelineLabel,
                        step.completed && styles.timelineLabelCompleted,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.timelineTime}>{step.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Items */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Articles commandés</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.item}>
              <View style={styles.itemLeft}>
                <Text style={styles.itemQuantity}>{item.quantity}x</Text>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {item.price * item.quantity} FCFA
              </Text>
            </View>
          ))}

          <Divider style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{order.total} FCFA</Text>
          </View>
        </Card>

        {/* Address */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Adresse de livraison</Text>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={24} color="#FF6B35" />
            <Text style={styles.addressText}>{order.address}</Text>
          </View>
        </Card>

        {/* Rating Section - Only for completed orders */}
        {order.status === 'completed' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Évaluation</Text>
            <Text style={styles.ratingSubtitle}>
              Partagez votre expérience avec nous
            </Text>

            <TouchableOpacity
              style={styles.ratingButton}
              onPress={() => openRatingModal('meal')}
            >
              <View style={styles.ratingButtonContent}>
                <Ionicons name="restaurant" size={24} color="#FF6B35" />
                <View style={styles.ratingButtonText}>
                  <Text style={styles.ratingButtonTitle}>Noter le repas</Text>
                  <Text style={styles.ratingButtonSubtitle}>
                    Qualité et goût
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ADB5BD" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ratingButton}
              onPress={() => openRatingModal('delivery')}
            >
              <View style={styles.ratingButtonContent}>
                <Ionicons name="bicycle" size={24} color="#FF6B35" />
                <View style={styles.ratingButtonText}>
                  <Text style={styles.ratingButtonTitle}>Noter le livreur</Text>
                  <Text style={styles.ratingButtonSubtitle}>
                    Service et rapidité
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#ADB5BD" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Map for active orders - MOBILE ONLY */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <DeliveryMap />
        )}

        {/* Actions */}
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <View style={styles.actions}>
            <Button
              mode="outlined"
              style={styles.actionButton}
              labelStyle={styles.actionButtonLabel}
              onPress={() => { }}
            >
              Contacter le livreur
            </Button>
            <Button
              mode="contained"
              style={[styles.actionButton, styles.cancelButton]}
              labelStyle={styles.cancelButtonLabel}
              onPress={() => { }}
            >
              Annuler la commande
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {ratingType === 'meal' ? 'Noter le repas' : 'Noter le livreur'}
              </Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {ratingType === 'meal'
                ? 'Comment était la qualité du repas ?'
                : 'Comment s\'est passée la livraison ?'}
            </Text>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#FFC107' : '#CED4DA'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Laissez un commentaire (optionnel)"
              placeholderTextColor="#ADB5BD"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                rating === 0 && styles.submitButtonDisabled,
              ]}
              onPress={submitRating}
              disabled={rating === 0}
            >
              <Text style={styles.submitButtonText}>Envoyer l'évaluation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  statusBanner: {
    padding: 24,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  orderInfo: {
    padding: 16,
    alignItems: 'center',
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
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E9ECEF',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#ADB5BD',
    fontWeight: '500',
  },
  timelineLabelCompleted: {
    color: '#495057',
    fontWeight: 'bold',
  },
  timelineTime: {
    fontSize: 12,
    color: '#ADB5BD',
    marginTop: 4,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginRight: 8,
    width: 30,
  },
  itemName: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#868E96',
  },
  divider: {
    marginVertical: 12,
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
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#868E96',
    marginBottom: 16,
  },
  ratingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  ratingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingButtonText: {
    marginLeft: 12,
    flex: 1,
  },
  ratingButtonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  ratingButtonSubtitle: {
    fontSize: 12,
    color: '#868E96',
    marginTop: 2,
  },
  actions: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
    borderColor: '#FF6B35',
  },
  actionButtonLabel: {
    fontSize: 14,
    color: '#FF6B35',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
  cancelButtonLabel: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#868E96',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  commentInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#495057',
    marginBottom: 24,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#CED4DA',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
});