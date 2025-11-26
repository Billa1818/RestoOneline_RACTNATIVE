// ============================================
// screens/Cart.js - Page Panier avec Modals
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';

export default function Cart({ navigation }) {
  const { cartItems } = useCart();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Cotonou, Akpakpa');
  const [tempAddress, setTempAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');

  const networks = ['MTN', 'MOOV', 'CELTIIS'];

  const mockCartItems = cartItems;

  const updateQuantity = (itemId, change) => {
    const updatedItems = mockCartItems.map(item => {
      if (item.id === itemId) {
        const newQuantity = Math.max(1, item.quantity + change);
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    saveCart(updatedItems);
  };

  const removeItem = (itemId) => {
    const updatedItems = mockCartItems.filter(item => item.id !== itemId);
    saveCart(updatedItems);
  };

  const calculateSubtotal = () => {
    return mockCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleAddressChange = () => {
    setTempAddress(deliveryAddress);
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    setDeliveryAddress(tempAddress);
    setAddressModalVisible(false);
  };

  const handleCheckout = () => {
    setCheckoutModalVisible(true);
  };

  const confirmOrder = () => {
    if (!phoneNumber) {
      alert('Veuillez entrer votre numéro de téléphone');
      return;
    }

    // Logique de commande ici
    console.log('Commande confirmée:', {
      network: selectedNetwork,
      phone: phoneNumber,
      total,
      items: mockCartItems
    });

    setCheckoutModalVisible(false);
    // Navigation vers une page de confirmation ou de suivi
    alert('Commande effectuée avec succès!');
  };

  const deliveryFee = 500;
  const subtotal = calculateSubtotal();
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#495057" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon Panier</Text>
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{mockCartItems.length}</Text>
        </View>
      </View>

      {mockCartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#CED4DA" />
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des plats pour commencer
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Parcourir les restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Restaurant Info */}
            <Card style={styles.restaurantCard}>
              <View style={styles.restaurantHeader}>
                <Ionicons name="storefront" size={24} color="#FF6B35" />
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>
                    {mockCartItems[0].restaurant}
                  </Text>
                  <View style={styles.deliveryInfo}>
                    <Ionicons name="time-outline" size={14} color="#868E96" />
                    <Text style={styles.deliveryText}>30-40 min</Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* Cart Items */}
            <Card style={styles.itemsCard}>
              <Text style={styles.sectionTitle}>Articles</Text>

              {mockCartItems.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.itemDivider} />}

                  <View style={styles.cartItem}>
                    <View style={styles.itemImageContainer}>
                      <Text style={styles.itemEmoji}>{item.image}</Text>
                    </View>

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price} FCFA</Text>
                    </View>

                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color="#FF6B35" />
                      </TouchableOpacity>

                      <Text style={styles.quantityText}>{item.quantity}</Text>

                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, 1)}
                      >
                        <Ionicons name="add" size={16} color="#FF6B35" />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeItem(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </Card>

            {/* Add More Items */}
            <TouchableOpacity
              style={styles.addMoreButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FF6B35" />
              <Text style={styles.addMoreText}>Ajouter d'autres articles</Text>
            </TouchableOpacity>

            {/* Delivery Address */}
            <Card style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color="#FF6B35" />
                <Text style={styles.sectionTitle}>Adresse de livraison</Text>
              </View>
              <Text style={styles.addressText}>{deliveryAddress}</Text>
              <TouchableOpacity
                style={styles.changeAddressButton}
                onPress={handleAddressChange}
              >
                <Text style={styles.changeAddressText}>Modifier l'adresse</Text>
              </TouchableOpacity>
            </Card>

            {/* Payment Summary */}
            <Card style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Résumé</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sous-total</Text>
                <Text style={styles.summaryValue}>{subtotal} FCFA</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de livraison</Text>
                <Text style={styles.summaryValue}>{deliveryFee} FCFA</Text>
              </View>

              <Divider style={styles.summaryDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{total} FCFA</Text>
              </View>
            </Card>

            {/* Spacer for bottom button */}
            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <View style={styles.checkoutContent}>
                <View>
                  <Text style={styles.checkoutButtonText}>Commander</Text>
                  <Text style={styles.checkoutButtonSubtext}>
                    {mockCartItems.length} article{mockCartItems.length > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={styles.checkoutTotal}>
                  <Text style={styles.checkoutTotalText}>{total} FCFA</Text>
                  <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Modal: Modifier l'adresse */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addressModalVisible}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier l'adresse</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Adresse de livraison</Text>
              <TextInput
                style={styles.textInput}
                value={tempAddress}
                onChangeText={setTempAddress}
                placeholder="Entrez votre adresse complète"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAddressModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveAddress}
              >
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Commander (Paiement) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={checkoutModalVisible}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmer la commande</Text>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Ionicons name="close" size={24} color="#495057" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Résumé de la commande */}
              <View style={styles.orderSummary}>
                <Text style={styles.summaryTitle}>Résumé</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total à payer</Text>
                  <Text style={styles.summaryValue}>{total} FCFA</Text>
                </View>
              </View>

              {/* Choix du réseau */}
              <Text style={styles.inputLabel}>Réseau de paiement mobile</Text>
              <View style={styles.networkContainer}>
                {networks.map((network) => (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.networkButton,
                      selectedNetwork === network && styles.networkButtonActive
                    ]}
                    onPress={() => setSelectedNetwork(network)}
                  >
                    <Text style={[
                      styles.networkButtonText,
                      selectedNetwork === network && styles.networkButtonTextActive
                    ]}>
                      {network}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Numéro de téléphone */}
              <Text style={styles.inputLabel}>Numéro de téléphone</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Ex: 97 XX XX XX"
                keyboardType="phone-pad"
                maxLength={15}
              />

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#FF6B35" />
                <Text style={styles.infoText}>
                  Vous recevrez une notification pour valider le paiement sur votre téléphone
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOrder}
              >
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    flex: 1,
    marginLeft: 16,
  },
  cartBadge: {
    backgroundColor: '#FF6B35',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#495057',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#868E96',
    marginTop: 8,
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 32,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  restaurantCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restaurantInfo: {
    marginLeft: 12,
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deliveryText: {
    fontSize: 12,
    color: '#868E96',
    marginLeft: 4,
  },
  itemsCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 32,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
  },
  itemPrice: {
    fontSize: 14,
    color: '#868E96',
    marginTop: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE5D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  itemDivider: {
    marginVertical: 8,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  addressCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
  },
  changeAddressButton: {
    alignSelf: 'flex-start',
  },
  changeAddressText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  summaryCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#868E96',
  },
  summaryValue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '600',
  },
  summaryDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
  },
  checkoutContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  checkoutButtonSubtext: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  checkoutTotal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  // Styles des Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
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
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#495057',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 50,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#868E96',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Styles spécifiques au modal de paiement
  orderSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 12,
  },
  networkContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  networkButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  networkButtonActive: {
    backgroundColor: '#FFE5D9',
    borderColor: '#FF6B35',
  },
  networkButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#868E96',
  },
  networkButtonTextActive: {
    color: '#FF6B35',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
});