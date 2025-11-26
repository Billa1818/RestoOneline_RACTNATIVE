// ============================================
// screens/Home.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import correct
import {
  Card,
  Chip,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Pour les icônes
import { StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function Home({ navigation }) {
  const [cart, setCart] = useState([]);
  const { isFavorite, addToFavorites, removeFromFavorites, addToCart: addDishToCart } = useCart();

  const categories = [
    { id: 1, name: 'Entrées', icon: 'restaurant', color: '#4CAF50' },
    { id: 2, name: 'Plats', icon: 'fast-food', color: '#FF9800' },
    { id: 3, name: 'Desserts', icon: 'ice-cream', color: '#E91E63' },
    { id: 4, name: 'Boissons', icon: 'wine', color: '#2196F3' },
  ];

  const dishes = [
    {
      id: 1,
      name: 'Poulet Yassa',
      description: 'Poulet mariné aux oignons et citron',
      price: 3500,
      image: 'https://via.placeholder.com/300x200/FF9800/FFFFFF?text=Poulet+Yassa',
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
      image: 'https://via.placeholder.com/300x200/F44336/FFFFFF?text=Riz+au+Gras',
      rating: 4.6,
      reviews: 98,
      time: '25 min',
    },
    {
      id: 3,
      name: 'Alloco Poisson',
      description: 'Bananes plantains frites + poisson',
      price: 2000,
      image: 'https://via.placeholder.com/300x200/FFC107/FFFFFF?text=Alloco',
      rating: 4.7,
      reviews: 156,
      time: '20 min',
      popular: true,
    },
    {
      id: 4,
      name: 'Salade Niçoise',
      description: 'Salade fraîche aux légumes',
      price: 1500,
      image: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Salade',
      rating: 4.5,
      reviews: 67,
      time: '15 min',
    },
  ];

  const addToCart = (dish) => {
    setCart([...cart, dish]);
    addDishToCart(dish);
  };

  const toggleFavorite = (dish) => {
    if (isFavorite(dish.id)) {
      removeFromFavorites(dish.id);
    } else {
      addToFavorites(dish);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Bienvenue chez{'\n'}DeliceCuisine</Text>
            <Text style={styles.bannerSubtitle}>
              Les meilleurs plats livrés chez vous
            </Text>
            <TouchableOpacity style={styles.bannerButton}>
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
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryCard, { backgroundColor: cat.color + '20' }]}
                >
                  <Ionicons name={cat.icon} size={40} color={cat.color} />
                  <Text style={styles.categoryText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Popular Dishes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="flame" size={24} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Plats Populaires</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('search')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {dishes.map((dish) => (
            <TouchableOpacity
              key={dish.id}
              onPress={() => navigation.navigate('DishDetails', { dish })}
            >
              <Card style={styles.dishCard}>
                <View style={styles.dishCardContent}>
                <Image
                  source={{ uri: dish.image }}
                  style={styles.dishImage}
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

                <IconButton
                  icon={isFavorite(dish.id) ? 'heart' : 'heart-outline'}
                  iconColor={isFavorite(dish.id) ? '#E91E63' : '#666'}
                  size={24}
                  style={styles.favoriteButton}
                  onPress={() => toggleFavorite(dish)}
                />

                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{dish.name}</Text>
                  <Text style={styles.dishDescription}>{dish.description}</Text>

                  <View style={styles.dishMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFC107" />
                      <Text style={styles.rating}>{dish.rating}</Text>
                      <Text style={styles.reviews}>({dish.reviews})</Text>
                    </View>

                    <View style={styles.timeContainer}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                      <Text style={styles.time}>{dish.time}</Text>
                    </View>
                  </View>

                  <View style={styles.dishFooter}>
                    <Text style={styles.price}>{dish.price} FCFA</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(dish)}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
  },
  banner: {
    backgroundColor: '#FF6B35',
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
    color: '#FF6B35',
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
    color: '#FF6B35',
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
  categoryText: {
    marginTop: 8,
    fontWeight: '600',
    color: '#333',
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
  popularChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B35',
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
    color: '#FF6B35',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: '#FF6B35',
  },
});