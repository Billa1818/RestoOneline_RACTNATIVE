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
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Card, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import * as orderService from '../services/orderService';

export default function Cart({ navigation }) {
  const { cartItems, clearCart } = useCart();
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('Cotonou, Akpakpa');
  const [deliveryLatitude, setDeliveryLatitude] = useState('6.3654200');
  const [deliveryLongitude, setDeliveryLongitude] = useState('2.4183800');
  const [tempAddress, setTempAddress] = useState('');
  const [deliveryDescription, setDeliveryDescription] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [cartId, setCartId] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(null);
  const { removeFromCart, updateCartQuantity } = useCart();

  const networks = ['MTN', 'MOOV', 'CELTIIS'];
  const deliveryFee = 500;

  // Récupérer l'ID de l'appareil et le panier au chargement
  useEffect(() => {
    const initializeCart = async () => {
      try {
        let device = await AsyncStorage.getItem('device_id');
        if (!device) {
          device = `device_${Date.now()}`;
          await AsyncStorage.setItem('device_id', device);
        }
        setDeviceId(device);

        // Récupérer ou créer le panier
        const cart = await orderService.getOrCreateCart(device);
        setCartId(cart.id);
      } catch (error) {
        console.error('Erreur initialisation panier:', error);
      }
    };
    initializeCart();
  }, []);

  // Retirer un article du panier
  const handleRemoveItem = async (item) => {
    Alert.alert(
      'Supprimer cet article?',
      `Êtes-vous sûr de vouloir supprimer "${item.menu_item_details?.name || item.item_name}" du panier?`,
      [
        {
          text: 'Non',
          onPress: () => {},
          style: 'cancel'
        },
        {
          text: 'Oui, supprimer',
          onPress: async () => {
            await removeItemFromCart(item);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const removeItemFromCart = async (item) => {
    if (!cartId) return;
    
    setRemovingItem(item.id);
    try {
      // Retirer via l'API
      await orderService.removeCartItem(cartId, item.id);
      
      // Retirer du panier local
      removeFromCart(item.id);
      
      Alert.alert('Succès', 'Article supprimé du panier');
    } catch (error) {
      console.error('Erreur suppression:', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'article');
    } finally {
      setRemovingItem(null);
    }
  };

  // Augmenter la quantité
  const handleIncreaseQuantity = async (item) => {
    await updateQuantity(item, item.quantity + 1);
  };

  // Diminuer la quantité
  const handleDecreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      await updateQuantity(item, item.quantity - 1);
    } else {
      // Si quantité = 1, demander si supprimer
      handleRemoveItem(item);
    }
  };

  const updateQuantity = async (item, newQuantity) => {
    if (!cartId) return;
    
    setUpdatingQuantity(item.id);
    try {
      // Mettre à jour via l'API
      await orderService.updateCartItem(cartId, item.id, newQuantity);
      
      // Mettre à jour le panier local
      updateCartQuantity(item.id, newQuantity);
    } catch (error) {
      console.error('Erreur mise à jour quantité:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = item.size_details?.price || item.price || 0;
      return sum + (parseFloat(itemPrice) * item.quantity);
    }, 0);
  };

  const handleAddressChange = () => {
    setTempAddress(deliveryAddress);
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    if (!tempAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse');
      return;
    }
    setDeliveryAddress(tempAddress);
    setAddressModalVisible(false);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Panier vide', 'Veuillez ajouter des articles avant de commander');
      return;
    }
    setCheckoutModalVisible(true);
  };

  const confirmOrder = async () => {
    // Validation des champs obligatoires
    if (!customerName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre nom');
      return;
    }
    if (!customerEmail.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre numéro de téléphone');
      return;
    }
    if (!deliveryAddress.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse de livraison');
      return;
    }

    if (!cartId) {
      Alert.alert('Erreur', 'Panier non initialisé');
      return;
    }

    setLoading(true);
    try {
      // Préparer les données de checkout
      const checkoutData = {
        delivery_address: deliveryAddress,
        delivery_latitude: parseFloat(deliveryLatitude),
        delivery_longitude: parseFloat(deliveryLongitude),
        delivery_description: deliveryDescription,
        customer_name: customerName,
        customer_phone: phoneNumber,
        customer_email: customerEmail,
        delivery_fee: deliveryFee.toString(),
        notes: `Paiement: ${selectedNetwork}`
      };

      // Effectuer le checkout via l'API
      const response = await orderService.checkoutCart(cartId, checkoutData);
      
      setLoading(false);
      setCheckoutModalVisible(false);

      // Afficher le numéro de commande et vider le panier local
      Alert.alert(
        'Succès',
        `Commande créée avec succès!\nNuméro: ${response.order_number}`,
        [
          {
            text: 'Suivre la commande',
            onPress: () => {
              clearCart();
              navigation.navigate('OrderTracking', { orderNumber: response.order_number });
            }
          },
          {
            text: 'Retour',
            onPress: () => {
              clearCart();
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      setLoading(false);
      const message = error.message || 'Erreur lors de la création de la commande';
      Alert.alert('Erreur', message);
      console.error('Erreur checkout:', error);
    }
  };

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
         <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
       </View>
      </View>

      {cartItems.length === 0 ? (
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
                 <Ionicons name="storefront" size={24} color="#5D0EC0" />
                 <View style={styles.restaurantInfo}>
                   <Text style={styles.restaurantName}>
                     {cartItems[0]?.menu_item_details?.name || 'Mon Restaurant'}
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

               {cartItems.map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.itemDivider} />}

                  <View style={styles.cartItem}>
                    <View style={styles.itemImageContainer}>
                      {item.menu_item_details?.image ? (
                        <Image
                          source={{ uri: item.menu_item_details.image }}
                          style={styles.itemImageReal}
                        />
                      ) : item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImageReal}
                        />
                      ) : (
                        <Text style={styles.itemEmoji}>
                          🍽️
                        </Text>
                      )}
                    </View>

                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>
                        {item.menu_item_details?.name || item.item_name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        {item.size_details?.price || item.item_price} FCFA
                      </Text>
                      {item.special_instructions && (
                        <Text style={styles.specialInstructions}>
                          {item.special_instructions}
                        </Text>
                      )}
                    </View>

                    <View style={styles.quantityControls}>
                       <TouchableOpacity
                         style={styles.quantityButton}
                         onPress={() => handleDecreaseQuantity(item)}
                         disabled={updatingQuantity === item.id}
                       >
                         <Ionicons name="remove" size={16} color="#5D0EC0" />
                       </TouchableOpacity>

                       <Text style={styles.quantityText}>{item.quantity}</Text>

                       <TouchableOpacity
                         style={styles.quantityButton}
                         onPress={() => handleIncreaseQuantity(item)}
                         disabled={updatingQuantity === item.id}
                       >
                         <Ionicons name="add" size={16} color="#5D0EC0" />
                       </TouchableOpacity>
                     </View>

                     <TouchableOpacity
                       style={styles.deleteButton}
                       onPress={() => handleRemoveItem(item)}
                       disabled={removingItem === item.id}
                     >
                       {removingItem === item.id ? (
                         <ActivityIndicator size="small" color="#F44336" />
                       ) : (
                         <Ionicons name="trash-outline" size={20} color="#F44336" />
                       )}
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
              <Ionicons name="add-circle-outline" size={20} color="#5D0EC0" />
              <Text style={styles.addMoreText}>Ajouter d'autres articles</Text>
            </TouchableOpacity>

            {/* Delivery Address */}
            <Card style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Ionicons name="location" size={20} color="#5D0EC0" />
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
              disabled={loading}
            >
              <View style={styles.checkoutContent}>
                <View>
                  <Text style={styles.checkoutButtonText}>Commander</Text>
                      <Text style={styles.checkoutButtonSubtext}>
                        {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
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
              {/* Informations client */}
              <Text style={styles.inputLabel}>Nom complet</Text>
              <TextInput
                style={styles.textInput}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Ex: Jean Dupont"
              />

              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                placeholder="Ex: jean.dupont@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

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
                <Ionicons name="information-circle-outline" size={20} color="#5D0EC0" />
                <Text style={styles.infoText}>
                  Vous recevrez une notification pour valider le paiement sur votre téléphone
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setCheckoutModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={confirmOrder}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                )}
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
    backgroundColor: '#5D0EC0',
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
    backgroundColor: '#5D0EC0',
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
    overflow: 'hidden',
  },
  itemImageReal: {
    width: 60,
    height: 60,
    borderRadius: 12,
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
  specialInstructions: {
    fontSize: 12,
    color: '#868E96',
    fontStyle: 'italic',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#495057',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
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
    color: '#5D0EC0',
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
    color: '#5D0EC0',
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
    color: '#5D0EC0',
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
    backgroundColor: '#5D0EC0',
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
    backgroundColor: '#5D0EC0',
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
    backgroundColor: '#5D0EC0',
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
    borderColor: '#5D0EC0',
  },
  networkButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#868E96',
  },
  networkButtonTextActive: {
    color: '#5D0EC0',
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