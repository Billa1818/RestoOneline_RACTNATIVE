// ============================================
// context/CartContext.js
// ============================================
import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => [...prev, item]);
    setCartCount(prev => prev + 1);
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    setCartCount(prev => Math.max(0, prev - 1));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
  };

  const addToFavorites = (item) => {
    setFavoriteItems(prev => [...prev, item]);
    setFavoritesCount(prev => prev + 1);
  };

  const removeFromFavorites = (itemId) => {
    setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
    setFavoritesCount(prev => Math.max(0, prev - 1));
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
      addToCart,
      removeFromCart,
      clearCart,
      addToFavorites,
      removeFromFavorites,
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