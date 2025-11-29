// ============================================
// context/CartContext.js - Avec persistence des favoris
// ============================================
import React, { createContext, useState, useContext, useEffect } from 'react';
import favoritesService from '../services/favoritesService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(true);

  // Charger les favoris au démarrage de l'app
  useEffect(() => {
    loadFavoritesFromStorage();
  }, []);

  const loadFavoritesFromStorage = async () => {
    try {
      setFavoritesLoading(true);
      const favorites = await favoritesService.loadFavorites();
      setFavoriteItems(favorites);
      setFavoritesCount(favorites.length);
      console.log('📱 Favoris chargés du stockage local:', favorites.length);
    } catch (error) {
      console.error('❌ Erreur chargement favoris:', error);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const addToCart = (item) => {
    setCartItems(prev => [...prev, item]);
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const updateCartQuantity = (itemId, newQuantity) => {
    setCartItems(prev => 
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  const addToFavorites = async (item) => {
    try {
      const updatedFavorites = await favoritesService.addFavorite(item);
      setFavoriteItems(updatedFavorites);
      setFavoritesCount(updatedFavorites.length);
    } catch (error) {
      console.error('❌ Erreur ajout favori:', error);
    }
  };

  const removeFromFavorites = async (itemId) => {
    try {
      const updatedFavorites = await favoritesService.removeFavorite(itemId);
      setFavoriteItems(updatedFavorites);
      setFavoritesCount(updatedFavorites.length);
    } catch (error) {
      console.error('❌ Erreur suppression favori:', error);
    }
  };

  const toggleFavorite = async (item) => {
    try {
      const updatedFavorites = await favoritesService.toggleFavorite(item);
      setFavoriteItems(updatedFavorites);
      setFavoritesCount(updatedFavorites.length);
    } catch (error) {
      console.error('❌ Erreur basculement favori:', error);
    }
  };

  const isFavorite = (itemId) => {
    return favoriteItems.some(item => item.id === itemId);
  };

  const isInCart = (itemId) => {
    return cartItems.some(item => item.id === itemId);
  };

  return (
    <CartContext.Provider value={{
      cartCount,
      favoritesCount,
      cartItems,
      favoriteItems,
      favoritesLoading,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addToFavorites,
      removeFromFavorites,
      toggleFavorite,
      isFavorite,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};