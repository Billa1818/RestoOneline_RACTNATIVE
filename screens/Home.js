// ============================================
// screens/Home.js - Configuré avec API réelle et gestion correcte des prix
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Card,
  Chip,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import MenuService from '../services/MenuService';
import * as orderService from '../services/orderService';
import favoritesService from '../services/favoritesService';

export default function Home({ navigation }) {
   const [categories, setCategories] = useState([]);
   const [popularDishes, setPopularDishes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [addingToCart, setAddingToCart] = useState(null);
   const [deviceId, setDeviceId] = useState(null);
   const { isFavorite, toggleFavorite, addToCart } = useCart();

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

  // Mapping des icônes pour les catégories
  const categoryIcons = {
    'entrees': 'restaurant',
    'plats': 'fast-food',
    'plats-principaux': 'fast-food',
    'desserts': 'ice-cream',
    'boissons': 'wine',
  };

  const categoryColors = {
    'entrees': '#4CAF50',
    'plats': '#FF9800',
    'plats-principaux': '#FF9800',
    'desserts': '#E91E63',
    'boissons': '#2196F3',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadPopularDishes(),
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await MenuService.getCategories();
      if (result.success && Array.isArray(result.data)) {
        setCategories(result.data);
      } else {
        console.error('Erreur catégories:', result.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Exception catégories:', error);
      setCategories([]);
    }
  };

  const loadPopularDishes = async () => {
    try {
      const result = await MenuService.getPopularItems();
      if (result.success && Array.isArray(result.data)) {
        setPopularDishes(result.data);
      } else {
        console.error('Erreur plats populaires:', result.error);
        setPopularDishes([]);
      }
    } catch (error) {
      console.error('Exception plats populaires:', error);
      setPopularDishes([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggleFavorite = async (dish) => {
    await toggleFavorite(dish);
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('Search', { 
      categorySlug: category.slug,
      categoryName: category.name 
    });
  };

  const handleAddToCart = (dish) => {
    // Toujours rediriger vers DishDetails pour ajouter au panier
    navigation.navigate('DishDetails', { dish });
  };

  const addToCartSimple = async (dish) => {
    if (!deviceId) {
      Alert.alert('Erreur', 'ID appareil non trouvé');
      return;
    }

    setAddingToCart(dish.id);
    try {
      // Récupérer ou créer le panier
      const cart = await orderService.getOrCreateCart(deviceId);
      
      // Utiliser le prix min_price du plat comme prix par défaut
      // (les formats complets sont récupérés dans DishDetails.js)
      const sizeId = 1; // Format par défaut
      const price = dish.min_price;
      
      await orderService.addItemToCart(
        cart.id,
        dish.id,
        sizeId,
        1,
        ''
      );

      // Ajouter au panier local aussi
      addToCart({
        ...dish,
        price: price,
        size: sizeId,
        menu_item_details: dish
      });

      Alert.alert('Succès', `${dish.name} ajouté au panier`);
    } catch (error) {
      console.error('Erreur ajout panier:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    } finally {
      setAddingToCart(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5D0EC0" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Bienvenue chez{'\n'}DeliceCuisine</Text>
            <Text style={styles.bannerSubtitle}>
              Les meilleurs plats livrés chez vous
            </Text>
            <TouchableOpacity 
              style={styles.bannerButton}
              onPress={() => navigation.navigate('Search')}
            >
              <Text style={styles.bannerButtonText}>Commander maintenant</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerEmoji}>🍽️</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories && categories.length > 0 ? (
                categories.map((cat) => {
                  const icon = categoryIcons[cat.slug] || 'fast-food';
                  const color = categoryColors[cat.slug] || '#FF9800';
                  
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryCard, { backgroundColor: color + '20' }]}
                      onPress={() => handleCategoryPress(cat)}
                    >
                      {cat.icon ? (
                        <Image 
                          source={{ uri: cat.icon }} 
                          style={styles.categoryIcon}
                        />
                      ) : (
                        <Ionicons name={icon} size={40} color={color} />
                      )}
                      <Text style={styles.categoryText}>{cat.name}</Text>
                      <Text style={styles.categoryCount}>
                        {cat.items_count} plat{cat.items_count > 1 ? 's' : ''}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.emptyCategoryText}>Aucune catégorie disponible</Text>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Popular Dishes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flame" size={24} color="#5D0EC0" />
              <Text style={styles.sectionTitle}>Plats Populaires</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {popularDishes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun plat disponible</Text>
            </View>
          ) : (
            popularDishes.map((dish) => (
              <TouchableOpacity
                key={dish.id}
                onPress={() => navigation.navigate('DishDetails', { dish })}
              >
                <Card style={styles.dishCard}>
                  <View style={styles.dishCardContent}>
                    {dish.image ? (
                      <Image
                        source={{ uri: dish.image }}
                        style={styles.dishImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.dishImage, styles.placeholderImage]}>
                        <Ionicons name="image-outline" size={60} color="#ccc" />
                      </View>
                    )}

                    <Chip
                      icon="fire"
                      style={styles.popularChip}
                      textStyle={styles.popularChipText}
                    >
                      Populaire
                    </Chip>

                    <IconButton
                       icon={isFavorite(dish.id) ? 'heart' : 'heart-outline'}
                       iconColor={isFavorite(dish.id) ? '#E91E63' : '#666'}
                       size={24}
                       style={styles.favoriteButton}
                       onPress={() => handleToggleFavorite(dish)}
                     />

                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      {dish.description && (
                        <Text style={styles.dishDescription} numberOfLines={2}>
                          {dish.description}
                        </Text>
                      )}

                      <View style={styles.dishMeta}>
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={16} color="#FFC107" />
                          <Text style={styles.rating}>
                            {parseFloat(dish.average_rating || 0).toFixed(1)}
                          </Text>
                          <Text style={styles.reviews}>
                            ({dish.total_ratings || 0})
                          </Text>
                        </View>

                        {dish.preparation_time && (
                          <View style={styles.timeContainer}>
                            <Ionicons name="time-outline" size={16} color="#666" />
                            <Text style={styles.time}>
                              {dish.preparation_time} min
                            </Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.dishFooter}>
                        <View>
                          <Text style={styles.price}>
                            {parseFloat(dish.min_price).toFixed(0)} FCFA
                          </Text>
                          {dish.min_price !== dish.max_price && (
                            <Text style={styles.priceRange}>
                              à {parseFloat(dish.max_price).toFixed(0)} FCFA
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                           style={[
                             styles.addButton,
                             addingToCart === dish.id && { opacity: 0.6 }
                           ]}
                           onPress={() => handleAddToCart(dish)}
                           disabled={addingToCart === dish.id}
                         >
                           {addingToCart === dish.id ? (
                             <ActivityIndicator size="small" color="#fff" />
                           ) : (
                             <Ionicons name="add" size={20} color="#fff" />
                           )}
                         </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
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
  banner: {
    backgroundColor: '#5D0EC0',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#5D0EC0',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerEmoji: {
    fontSize: 60,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  seeAll: {
    color: '#5D0EC0',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryCard: {
    width: 100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  categoryText: {
    marginTop: 8,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  categoryCount: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  dishCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  dishCardContent: {
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popularChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#5D0EC0',
  },
  popularChipText: {
    color: '#fff',
    fontSize: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
  },
  dishInfo: {
    padding: 16,
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  dishMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
    color: '#333',
  },
  reviews: {
    marginLeft: 4,
    color: '#666',
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginLeft: 4,
    color: '#666',
    fontSize: 14,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5D0EC0',
  },
  priceRange: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#5D0EC0',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  emptyCategoryText: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 16,
  },
});