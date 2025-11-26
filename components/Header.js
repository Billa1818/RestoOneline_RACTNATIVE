// ============================================
// components/Header.js
// ============================================
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Pressable,
  Alert,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Notification from './Notification';
import { useCart } from '../context/CartContext';


// Données simulées de favoris
const MOCK_FAVORITES = [
  {
    id: 1,
    name: 'Pizza Margherita',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    category: 'Italien'
  },
  {
    id: 2,
    name: 'Burger Deluxe',
    price: 2800,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Fast Food'
  },
  {
    id: 3,
    name: 'Sushi Assortiment',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400',
    category: 'Japonais'
  },
  {
    id: 4,
    name: 'Salade César',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    category: 'Santé'
  },
  {
    id: 5,
    name: 'Tacos Poulet',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400',
    category: 'Mexicain'
  }
];

export default function Header({
  cartCount = 3, // Valeur simulée
  navigation = null // Ajout d'une valeur par défaut
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const { favoriteItems, removeFromFavorites } = useCart();
  const [cart, setCart] = useState([]);

  const handleRemoveFavorite = (itemId) => {
    Alert.alert(
      'Retirer des favoris',
      'Voulez-vous retirer ce plat de vos favoris ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            removeFromFavorites(itemId);
            Alert.alert('Retiré', 'Le plat a été retiré de vos favoris');
          }
        }
      ]
    );
  };

  const handleAddToCart = (item) => {
    setCart([...cart, item]);
    Alert.alert(
      'Ajouté au panier',
      `${item.name} a été ajouté à votre panier`,
      [{ text: 'OK' }]
    );
  };

  const renderFavoriteItem = ({ item }) => (
    <View style={styles.favoriteItem}>
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        <Text style={styles.favoriteCategory}>{item.category}</Text>
        <Text style={styles.favoritePrice}>{item.price} FCFA</Text>
      </View>
      <View style={styles.favoriteActions}>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => handleRemoveFavorite(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#E91E63" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.logoContainer}>
          <Ionicons name="restaurant" size={32} color="#FF6B35" />
          <Text style={styles.logoText}>RestoOnline</Text>
        </View>

        <View style={styles.headerIcons}>
          {/* Bouton Notifications */}
          <Notification />

          {/* Bouton Favoris */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="heart" size={24} color="#E91E63" />
            {favoriteItems.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favoriteItems.length}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Bouton Panier */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              if (navigation && navigation.navigate) {
                navigation.navigate('Cart');
              } else {
                Alert.alert('Panier', `Vous avez ${cartCount} articles dans votre panier`);
              }
            }}
          >
            <Ionicons name="cart-outline" size={24} color="#495057" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Favoris */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Mes Favoris</Text>
                <Text style={styles.modalSubtitle}>
                  {favoriteItems.length} plat{favoriteItems.length > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={28} color="#495057" />
              </TouchableOpacity>
            </View>

            {favoriteItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color="#CED4DA" />
                <Text style={styles.emptyText}>Aucun favori</Text>
                <Text style={styles.emptySubtext}>
                  Ajoutez vos plats préférés ici
                </Text>
                <TouchableOpacity
                  style={styles.closeModalBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeModalBtnText}>Découvrir nos plats</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={favoriteItems}
                renderItem={renderFavoriteItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.favoritesList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    padding: 8,
    marginLeft: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#E91E63',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#74C0FC',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Styles du Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
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
  modalSubtitle: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  favoritesList: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  favoriteImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E9ECEF',
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
  },
  favoriteCategory: {
    fontSize: 12,
    color: '#ADB5BD',
    marginBottom: 4,
  },
  favoritePrice: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  favoriteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addToCartBtn: {
    backgroundColor: '#74C0FC',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#74C0FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  removeBtn: {
    backgroundColor: '#FFE5ED',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ADB5BD',
    marginTop: 8,
    textAlign: 'center',
  },
  closeModalBtn: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});