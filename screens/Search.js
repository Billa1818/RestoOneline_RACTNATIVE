// ============================================
// screens/Search.js - Configuré avec API réelle
// ============================================
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import MenuService from '../services/MenuService';
import * as orderService from '../services/orderService';

export default function Search({ navigation, route }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.categorySlug || 'all');
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const { isFavorite, addToFavorites, removeFromFavorites, addToCart } = useCart();

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

  // Icônes par défaut pour les catégories
  const categoryIcons = {
    'entrees': 'leaf',
    'plats': 'restaurant',
    'plats-principaux': 'restaurant',
    'desserts': 'ice-cream',
    'boissons': 'water',
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Charger les plats quand la catégorie change
    if (!loading) {
      loadDishes();
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Si on arrive depuis Home avec une catégorie
    if (route?.params?.categorySlug) {
      setSelectedCategory(route.params.categorySlug);
    }
  }, [route?.params?.categorySlug]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCategories(),
        loadDishes(),
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await MenuService.getCategories();
      if (result.success && Array.isArray(result.data)) {
        // Ajouter la catégorie "Tout" au début
        setCategories([
          { id: 'all', slug: 'all', name: 'Tout', icon: null },
          ...result.data
        ]);
      } else {
        console.error('Erreur catégories:', result.error);
        setCategories([{ id: 'all', slug: 'all', name: 'Tout', icon: null }]);
      }
    } catch (error) {
      console.error('Exception catégories:', error);
      setCategories([{ id: 'all', slug: 'all', name: 'Tout', icon: null }]);
    }
  };

  const loadDishes = async () => {
    try {
      const filters = {};
      
      // Ajouter le filtre de catégorie si ce n'est pas "all"
      if (selectedCategory && selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }
      
      // Ajouter le filtre de recherche si présent
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const result = await MenuService.getMenuItems(filters);
      if (result.success && Array.isArray(result.data)) {
        setDishes(result.data);
      } else {
        console.error('Erreur plats:', result.error);
        setDishes([]);
      }
    } catch (error) {
      console.error('Exception plats:', error);
      setDishes([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = () => {
    loadDishes();
  };

  const toggleFavorite = (dish) => {
    if (isFavorite(dish.id)) {
      removeFromFavorites(dish.id);
    } else {
      addToFavorites(dish);
    }
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
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un plat..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholderTextColor="#999"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearchQuery('');
              loadDishes();
            }}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((cat) => {
          const icon = cat.slug === 'all' ? 'apps' : categoryIcons[cat.slug] || 'pricetag';
          const isSelected = selectedCategory === cat.slug;
          
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.slug)}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
              ]}
            >
              <Ionicons
                name={icon}
                size={20}
                color={isSelected ? '#fff' : '#666'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isSelected && styles.categoryChipTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.resultsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.resultsCount}>
          {dishes.length} résultat{dishes.length > 1 ? 's' : ''}
        </Text>

        {dishes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Aucun résultat</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Essayez une autre recherche' : 'Aucun plat disponible'}
            </Text>
          </View>
        ) : (
          <View style={styles.dishesGrid}>
            {dishes.map((dish) => (
              <Card key={dish.id} style={styles.dishCard}>
                <TouchableOpacity onPress={() => navigation.navigate('DishDetails', { dish })}>
                  {dish.image ? (
                    <Image 
                      source={{ uri: dish.image }} 
                      style={styles.dishImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.dishImage, styles.placeholderImage]}>
                      <Ionicons name="image-outline" size={40} color="#ccc" />
                    </View>
                  )}
                  
                  <IconButton
                    icon={isFavorite(dish.id) ? 'heart' : 'heart-outline'}
                    iconColor={isFavorite(dish.id) ? '#E91E63' : '#666'}
                    size={20}
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(dish)}
                  />

                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName} numberOfLines={1}>
                      {dish.name}
                    </Text>
                    {dish.description && (
                      <Text style={styles.dishDescription} numberOfLines={2}>
                        {dish.description}
                      </Text>
                    )}

                    <View style={styles.dishFooter}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <Text style={styles.rating}>
                          {parseFloat(dish.average_rating || 0).toFixed(1)}
                        </Text>
                      </View>
                      <Text style={styles.price}>
                        {parseFloat(dish.min_price).toFixed(0)} F
                      </Text>
                    </View>

                    {dish.preparation_time && (
                      <View style={styles.dishTime}>
                        <Ionicons name="time-outline" size={12} color="#5D0EC0" />
                        <Text style={styles.timeText}>{dish.preparation_time} min</Text>
                      </View>
                    )}

                    <TouchableOpacity
                       style={[
                         styles.addToCartButton,
                         addingToCart === dish.id && { opacity: 0.6 }
                       ]}
                       onPress={(e) => {
                         e.stopPropagation();
                         handleAddToCart(dish);
                       }}
                       disabled={addingToCart === dish.id}
                     >
                       {addingToCart === dish.id ? (
                         <ActivityIndicator size="small" color="#fff" />
                       ) : (
                         <>
                           <Ionicons name="add" size={16} color="#fff" />
                           <Text style={styles.addToCartText}>Ajouter</Text>
                         </>
                       )}
                     </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES pour Search.js
// ============================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  searchHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoriesScroll: {
    backgroundColor: '#fff',
    maxHeight: 60,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    marginRight: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#5D0EC0',
  },
  categoryChipText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  dishesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dishCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  dishImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#fff',
  },
  dishInfo: {
    padding: 12,
  },
  dishName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dishDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5D0EC0',
  },
  dishTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#5D0EC0',
    fontWeight: '600',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: '#5D0EC0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});