// ============================================
// screens/DishDetails.js - Configuré avec API réelle
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Chip,
  IconButton,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import MenuService from '../services/MenuService';
import * as orderService from '../services/orderService';

export default function DishDetails({ route, navigation }) {
  const { dish: initialDish } = route.params;
  const [dish, setDish] = useState(initialDish);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [specialNotes, setSpecialNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [sizes, setSizes] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  
  const { 
    addToCart: addToCartContext, 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites 
  } = useCart();

  // Récupérer le device_id au chargement
  useEffect(() => {
    const getDeviceId = async () => {
      try {
        let device = await AsyncStorage.getItem('device_id');
        if (!device) {
          device = `device_${Date.now()}`;
          await AsyncStorage.setItem('device_id', device);
        }
        setDeviceId(device);
      } catch (error) {
        console.error('Erreur device_id:', error);
      }
    };
    getDeviceId();
  }, []);

  useEffect(() => {
    loadDishDetails();
  }, []);

  const loadDishDetails = async () => {
    try {
      setLoading(true);
      
      // Charger les détails complets du plat
      const result = await MenuService.getMenuItemBySlug(initialDish.slug);
      
      if (result.success && result.data) {
        setDish(result.data);
        
        // Charger les formats si disponibles
        if (result.data.id) {
          const sizesResult = await MenuService.getMenuSizes(result.data.id);
          if (sizesResult.success && sizesResult.data && sizesResult.data.length > 0) {
            setSizes(sizesResult.data);
            // Sélectionner le premier format par défaut
            setSelectedSize(sizesResult.data[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = async () => {
    // Validation
    if (!deviceId) {
      Alert.alert('Erreur', 'ID appareil non trouvé');
      return;
    }

    const selectedSizeData = sizes.find(s => s.id === selectedSize);
    if (!selectedSizeData) {
      Alert.alert('Erreur', 'Veuillez sélectionner un format');
      return;
    }

    setAddingToCart(true);
    try {
      // Récupérer ou créer le panier
      const cart = await orderService.getOrCreateCart(deviceId);
      
      // Ajouter l'article au panier
      await orderService.addItemToCart(
        cart.id,
        dish.id,
        selectedSizeData.id,
        quantity,
        specialNotes.trim()
      );

      // Ajouter au panier local aussi
      addToCartContext({
        ...dish,
        quantity: quantity,
        special_instructions: specialNotes.trim(),
        size: selectedSizeData.id,
        size_details: selectedSizeData,
        menu_item_details: dish,
        price: selectedSizeData.price,
      });

      const sizeName = selectedSizeData.name;
      Alert.alert(
        'Succès', 
        `${quantity}x ${dish.name} (${sizeName}) ajouté au panier`,
        [
          {
            text: 'Continuer',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Voir le panier',
            onPress: () => navigation.navigate('Cart')
          }
        ]
      );
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    if (isFavorite(dish.id)) {
      removeFromFavorites(dish.id);
    } else {
      addToFavorites(dish);
    }
  };

  // Calculer le prix total
  const getCurrentPrice = () => {
    if (sizes.length > 0 && selectedSize) {
      const size = sizes.find(s => s.id === selectedSize);
      return size ? size.price : dish.min_price;
    }
    return dish.min_price;
  };

  const totalPrice = getCurrentPrice() * quantity;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D0EC0" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec bouton retour */} 
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails du plat</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Image principale */}
        <View style={styles.imageContainer}>
          {dish.image ? (
            <Image
              source={{ uri: dish.image }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mainImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={80} color="#ccc" />
            </View>
          )}
          
          {dish.is_popular && (
            <Chip
              icon="fire"
              style={styles.popularChip}
              textStyle={styles.popularChipText}
            >
              Populaire
            </Chip>
          )}
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Ionicons
              name={isFavorite(dish.id) ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite(dish.id) ? '#E91E63' : '#333'}
            />
          </TouchableOpacity>
        </View>

        {/* Informations du plat */}
        <View style={styles.content}>
          {/* Nom et description */}
          <View style={styles.infoSection}>
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dishName}>{dish.name}</Text>
                {dish.description && (
                  <Text style={styles.dishDescription}>{dish.description}</Text>
                )}
              </View>
            </View>

            {/* Rating et reviews */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingCard}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={20} color="#FFC107" />
                  <Text style={styles.ratingText}>
                    {parseFloat(dish.average_rating || 0).toFixed(1)}
                  </Text>
                </View>
                <Text style={styles.ratingLabel}>Évaluation</Text>
              </View>

              <View style={styles.reviewsCard}>
                <Text style={styles.reviewsNumber}>{dish.total_ratings || 0}</Text>
                <Text style={styles.reviewsLabel}>Avis</Text>
              </View>

              {dish.preparation_time && (
                <View style={styles.timeCard}>
                  <View style={styles.timeRow}>
                    <Ionicons name="time-outline" size={20} color="#5D0EC0" />
                    <Text style={styles.timeText}>{dish.preparation_time} min</Text>
                  </View>
                  <Text style={styles.timeLabel}>Temps</Text>
                </View>
              )}
            </View>
          </View>

          {/* Section formats/tailles si disponibles */}
          {sizes.length > 0 && (
            <View style={styles.sizeSection}>
              <Text style={styles.sizeLabel}>Choisissez votre format</Text>
              <View style={styles.sizeContainer}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    style={[
                      styles.sizeOption,
                      selectedSize === size.id && styles.sizeOptionSelected,
                      !size.is_available && styles.sizeOptionDisabled,
                    ]}
                    onPress={() => size.is_available && setSelectedSize(size.id)}
                    disabled={!size.is_available}
                  >
                    <Text
                      style={[
                        styles.sizeOptionLabel,
                        selectedSize === size.id && styles.sizeOptionLabelSelected,
                        !size.is_available && styles.sizeOptionLabelDisabled,
                      ]}
                    >
                      {size.name}
                    </Text>
                    <Text
                      style={[
                        styles.sizeOptionPrice,
                        selectedSize === size.id && styles.sizeOptionPriceSelected,
                        !size.is_available && styles.sizeOptionPriceDisabled,
                      ]}
                    >
                      {parseFloat(size.price).toFixed(0)} FCFA
                    </Text>
                    {!size.is_available && (
                      <Text style={styles.unavailableText}>Indisponible</Text>
                    )}
                    {selectedSize === size.id && size.is_available && (
                      <View style={styles.checkmarkContainer}>
                        <Ionicons name="checkmark-circle" size={24} color="#5D0EC0" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Section détails supplémentaires */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Ionicons name="leaf" size={20} color="#4CAF50" />
                <Text style={styles.detailText}>Ingrédients frais sélectionnés</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="flame" size={20} color="#5D0EC0" />
                <Text style={styles.detailText}>Préparé à la commande</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.detailText}>100% Satisfait ou remboursé</Text>
              </View>
            </View>
          </Card>

          {/* Section quantité */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantité</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
              >
                <Ionicons name="remove" size={24} color="#5D0EC0" />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityValue}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={24} color="#5D0EC0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Formulaire de notes spéciales */}
          <View style={styles.notesSection}>
            <View style={styles.notesSectionHeader}>
              <Ionicons name="document-text-outline" size={20} color="#5D0EC0" />
              <Text style={styles.notesLabel}>Instructions spéciales</Text>
            </View>
            <Text style={styles.notesSubLabel}>
              Allergies, préférences, modifications...
            </Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Ex: Sans oignons, peu épicé, extra sauce..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              value={specialNotes}
              onChangeText={setSpecialNotes}
              textAlignVertical="top"
            />
            <Text style={styles.notesHint}>
              💡 Ces informations seront transmises au restaurant
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Pied de page avec prix et bouton ajouter */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Prix total</Text>
          <Text style={styles.totalPrice}>{parseFloat(totalPrice).toFixed(0)} FCFA</Text>
          <Text style={styles.priceDetail}>
            {quantity}x • {parseFloat(getCurrentPrice()).toFixed(0)} FCFA/unité
          </Text>
        </View>
        <Button
           mode="contained"
           style={[styles.addButton, addingToCart && { opacity: 0.6 }]}
           labelStyle={styles.addButtonLabel}
           onPress={addToCart}
           icon={addingToCart ? undefined : 'cart-plus'}
           disabled={!dish.is_available || (sizes.length > 0 && !selectedSize) || addingToCart}
           loading={addingToCart}
         >
           {!dish.is_available ? 'Indisponible' : addingToCart ? 'Ajout...' : 'Ajouter'}
         </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#5D0EC0',
  },
  popularChipText: {
    color: '#fff',
    fontSize: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ratingCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#999',
  },
  reviewsCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  reviewsNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5D0EC0',
    marginBottom: 4,
  },
  reviewsLabel: {
    fontSize: 12,
    color: '#999',
  },
  timeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  timeLabel: {
    fontSize: 12,
    color: '#999',
  },
  sizeSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sizeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sizeOption: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    position: 'relative',
  },
  sizeOptionSelected: {
    backgroundColor: '#F3E5F5',
    borderColor: '#5D0EC0',
  },
  sizeOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#fafafa',
  },
  sizeOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  sizeOptionLabelSelected: {
    color: '#5D0EC0',
  },
  sizeOptionLabelDisabled: {
    color: '#999',
  },
  sizeOptionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sizeOptionPriceSelected: {
    color: '#5D0EC0',
  },
  sizeOptionPriceDisabled: {
    color: '#999',
  },
  unavailableText: {
    fontSize: 10,
    color: '#E91E63',
    marginTop: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  detailsCard: {
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  detailsContent: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  quantitySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    borderRadius: 8,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  quantityDisplay: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  notesSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  notesSubLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    marginLeft: 28,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    minHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  notesHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceSection: {
    justifyContent: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5D0EC0',
  },
  priceDetail: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#5D0EC0',
    marginLeft: 12,
    paddingVertical: 4,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
}); 