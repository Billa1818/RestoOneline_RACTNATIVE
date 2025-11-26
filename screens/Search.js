// ============================================
// screens/Search.js - Page Recherche
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Card, Chip, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function Search({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { isFavorite, addToFavorites, removeFromFavorites, addToCart } = useCart();

  const categories = [
    { id: 'all', name: 'Tout', icon: 'apps' },
    { id: 'entrees', name: 'Entrées', icon: 'leaf' },
    { id: 'plats', name: 'Plats', icon: 'restaurant' },
    { id: 'desserts', name: 'Desserts', icon: 'cupcake' },
    { id: 'boissons', name: 'Boissons', icon: 'water' },
  ];

  const allDishes = [
    {
      id: 1,
      name: 'Poulet Yassa',
      description: 'Poulet mariné aux oignons et citron',
      price: 3500,
      category: 'plats',
      image: 'https://picsum.photos/seed/poulet/300/200',
      rating: 4.8,
      reviews: 124,
      time: '30 min',
      popular: true,
    },
    {
      id: 2,
      name: 'Riz au Gras',
      description: 'Riz cuisiné à la sauce tomate',
      price: 2500,
      category: 'plats',
      image: 'https://picsum.photos/seed/riz/300/200',
      rating: 4.6,
      reviews: 98,
      time: '25 min',
    },
    {
      id: 3,
      name: 'Salade Niçoise',
      description: 'Salade fraîche aux légumes',
      price: 1500,
      category: 'entrees',
      image: 'https://picsum.photos/seed/salade/300/200',
      rating: 4.5,
      reviews: 67,
      time: '15 min',
    },
    {
      id: 4,
      name: 'Tiramisu',
      description: 'Dessert italien traditionnel',
      price: 1800,
      category: 'desserts',
      image: 'https://picsum.photos/seed/tiramisu/300/200',
      rating: 4.9,
      reviews: 89,
      time: '10 min',
    },
    {
      id: 5,
      name: 'Jus Bissap',
      description: 'Jus naturel d\'hibiscus',
      price: 800,
      category: 'boissons',
      image: 'https://picsum.photos/seed/bissap/300/200',
      rating: 4.7,
      reviews: 56,
      time: '5 min',
    },
    {
      id: 6,
      name: 'Alloco Poisson',
      description: 'Bananes plantains frites + poisson',
      price: 2000,
      category: 'plats',
      image: 'https://picsum.photos/seed/alloco/300/200',
      rating: 4.7,
      reviews: 156,
      time: '20 min',
      popular: true,
    },
  ];

  const filteredDishes = allDishes.filter((dish) => {
    const matchesSearch = dish.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (dish) => {
    if (isFavorite(dish.id)) {
      removeFromFavorites(dish.id);
    } else {
      addToFavorites(dish);
    }
  };

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
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
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
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryChip,
              selectedCategory === cat.id && styles.categoryChipSelected,
            ]}
          >
            <Ionicons
              name={cat.icon}
              size={20}
              color={selectedCategory === cat.id ? '#fff' : '#666'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextSelected,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {filteredDishes.length} résultat{filteredDishes.length > 1 ? 's' : ''}
        </Text>

        {filteredDishes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fast-food-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Aucun résultat</Text>
            <Text style={styles.emptySubtext}>
              Essayez une autre recherche
            </Text>
          </View>
        ) : (
          <View style={styles.dishesGrid}>
            {filteredDishes.map((dish) => (
              <Card key={dish.id} style={styles.dishCard}>
                <TouchableOpacity onPress={() => navigation.navigate('DishDetails', { dish })}>
                  <Image source={{ uri: dish.image }} style={styles.dishImage} />
                  
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
                    <Text style={styles.dishDescription} numberOfLines={2}>
                      {dish.description}
                    </Text>

                    <View style={styles.dishFooter}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <Text style={styles.rating}>{dish.rating}</Text>
                      </View>
                      <Text style={styles.price}>{dish.price} F</Text>
                    </View>

                    <View style={styles.dishTime}>
                      <Ionicons name="time-outline" size={12} color="#FF6B35" />
                      <Text style={styles.timeText}>{dish.time}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.addToCartButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToCart(dish);
                      }}
                    >
                      <Ionicons name="add" size={16} color="#fff" />
                      <Text style={styles.addToCartText}>Ajouter</Text>
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
    backgroundColor: '#FFF5F0',
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
    backgroundColor: '#FF6B35',
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
    color: '#FF6B35',
  },
  dishTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: '#FF6B35',
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