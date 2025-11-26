// ============================================
// screens/DishDetails.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Chip,
  IconButton,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function DishDetails({ route, navigation }) {
  const { dish } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart: addToCartContext, isFavorite: checkIsFavorite, addToFavorites, removeFromFavorites } = useCart();

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = () => {
    // Ajouter la quantité du plat au panier
    for (let i = 0; i < quantity; i++) {
      addToCartContext(dish);
    }
    Alert.alert('Succès', `${quantity}x ${dish.name} ajouté au panier`);
    navigation.goBack();
  };

  const totalPrice = dish.price * quantity;

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
          <Image
            source={{ uri: dish.image }}
            style={styles.mainImage}
          />
          {dish.popular && (
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
            onPress={() => {
              if (checkIsFavorite(dish.id)) {
                removeFromFavorites(dish.id);
              } else {
                addToFavorites(dish);
              }
              setIsFavorite(!isFavorite);
            }}
          >
            <Ionicons
              name={checkIsFavorite(dish.id) ? 'heart' : 'heart-outline'}
              size={28}
              color={checkIsFavorite(dish.id) ? '#E91E63' : '#333'}
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
                <Text style={styles.dishDescription}>{dish.description}</Text>
              </View>
            </View>

            {/* Rating et reviews */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingCard}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={20} color="#FFC107" />
                  <Text style={styles.ratingText}>{dish.rating}</Text>
                </View>
                <Text style={styles.ratingLabel}>Évaluation</Text>
              </View>

              <View style={styles.reviewsCard}>
                <Text style={styles.reviewsNumber}>{dish.reviews}</Text>
                <Text style={styles.reviewsLabel}>Avis</Text>
              </View>

              <View style={styles.timeCard}>
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={20} color="#FF6B35" />
                  <Text style={styles.timeText}>{dish.time}</Text>
                </View>
                <Text style={styles.timeLabel}>Temps</Text>
              </View>
            </View>
          </View>

          {/* Section détails supplémentaires */}
          <Card style={styles.detailsCard}>
            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Ionicons name="leaf" size={20} color="#4CAF50" />
                <Text style={styles.detailText}>Ingrédients frais sélectionnés</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="flame" size={20} color="#FF6B35" />
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
                <Ionicons name="remove" size={24} color="#FF6B35" />
              </TouchableOpacity>

              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityValue}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes de la commande */}
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>Notes spéciales (optionnel)</Text>
            <TouchableOpacity style={styles.notesInput}>
              <Text style={styles.notesPlaceholder}>
                Ajoutez des notes ou des modifications...
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ScrollView>

      {/* Pied de page avec prix et bouton ajouter */}
      <View style={styles.footer}>
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Prix total</Text>
          <Text style={styles.totalPrice}>{totalPrice} FCFA</Text>
        </View>
        <Button
          mode="contained"
          style={styles.addButton}
          labelStyle={styles.addButtonLabel}
          onPress={addToCart}
        >
          Ajouter au panier
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
    resizeMode: 'cover',
  },
  popularChip: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF6B35',
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
    color: '#FF6B35',
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
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    minHeight: 60,
    justifyContent: 'center',
  },
  notesPlaceholder: {
    color: '#999',
    fontSize: 14,
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
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    flex: 1,
    marginLeft: 12,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
