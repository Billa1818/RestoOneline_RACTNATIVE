// ============================================
// services/favoritesService.js - Service pour les favoris persistants
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = 'app_favorites';

/**
 * Service de gestion des favoris avec persistence locale
 */
const favoritesService = {
  /**
   * Charger tous les favoris depuis le stockage local
   * @returns {Promise<Array>} Liste des favoris
   */
  loadFavorites: async () => {
    try {
      const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favoritesJson) {
        const favorites = JSON.parse(favoritesJson);
        console.log(' Favoris chargés:', favorites.length);
        return favorites;
      }
      return [];
    } catch (error) {
      console.error(' Erreur chargement favoris:', error);
      return [];
    }
  },

  /**
   * Ajouter un élément aux favoris
   * @param {Object} item - Élément à ajouter
   * @returns {Promise<Array>} Liste mise à jour
   */
  addFavorite: async (item) => {
    try {
      const favorites = await favoritesService.loadFavorites();
      
      // Vérifier si l'élément n'est pas déjà dans les favoris
      const exists = favorites.some(fav => fav.id === item.id);
      if (exists) {
        console.log(' Élément déjà en favori:', item.id);
        return favorites;
      }

      // Ajouter l'élément complet aux favoris
      const newFavorite = {
        ...item,
        addedToFavoritesAt: new Date().toISOString()
      };
      
      const updatedFavorites = [...favorites, newFavorite];
      
      // Sauvegarder
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      console.log(' Favori ajouté:', item.name, '(Total:', updatedFavorites.length + ')');
      
      return updatedFavorites;
    } catch (error) {
      console.error(' Erreur ajout favori:', error);
      throw error;
    }
  },

  /**
   * Retirer un élément des favoris
   * @param {number} itemId - ID de l'élément
   * @returns {Promise<Array>} Liste mise à jour
   */
  removeFavorite: async (itemId) => {
    try {
      const favorites = await favoritesService.loadFavorites();
      
      const updatedFavorites = favorites.filter(fav => fav.id !== itemId);
      
      // Sauvegarder
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));
      console.log(' Favori retiré, ID:', itemId, '(Total:', updatedFavorites.length + ')');
      
      return updatedFavorites;
    } catch (error) {
      console.error(' Erreur suppression favori:', error);
      throw error;
    }
  },

  /**
   * Vérifier si un élément est dans les favoris
   * @param {number} itemId - ID de l'élément
   * @returns {Promise<boolean>}
   */
  isFavorite: async (itemId) => {
    try {
      const favorites = await favoritesService.loadFavorites();
      return favorites.some(fav => fav.id === itemId);
    } catch (error) {
      console.error(' Erreur vérification favori:', error);
      return false;
    }
  },

  /**
   * Obtenir un favori spécifique
   * @param {number} itemId - ID de l'élément
   * @returns {Promise<Object|null>}
   */
  getFavorite: async (itemId) => {
    try {
      const favorites = await favoritesService.loadFavorites();
      return favorites.find(fav => fav.id === itemId) || null;
    } catch (error) {
      console.error(' Erreur récupération favori:', error);
      return null;
    }
  },

  /**
   * Basculer le statut favori d'un élément
   * @param {Object} item - Élément à basculer
   * @returns {Promise<Array>} Liste mise à jour
   */
  toggleFavorite: async (item) => {
    try {
      const isFav = await favoritesService.isFavorite(item.id);
      
      if (isFav) {
        return await favoritesService.removeFavorite(item.id);
      } else {
        return await favoritesService.addFavorite(item);
      }
    } catch (error) {
      console.error(' Erreur basculement favori:', error);
      throw error;
    }
  },

  /**
   * Vider tous les favoris
   * @returns {Promise<void>}
   */
  clearFavorites: async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      console.log('✅ Tous les favoris supprimés');
    } catch (error) {
      console.error('❌ Erreur suppression favoris:', error);
      throw error;
    }
  },

  /**
   * Obtenir le nombre de favoris
   * @returns {Promise<number>}
   */
  getFavoritesCount: async () => {
    try {
      const favorites = await favoritesService.loadFavorites();
      return favorites.length;
    } catch (error) {
      console.error(' Erreur comptage favoris:', error);
      return 0;
    }
  },

  /**
   * Exporter les favoris (pour backup)
   * @returns {Promise<string>} JSON string des favoris
   */
  exportFavorites: async () => {
    try {
      const favorites = await favoritesService.loadFavorites();
      return JSON.stringify(favorites, null, 2);
    } catch (error) {
      console.error(' Erreur export favoris:', error);
      return null;
    }
  },

  /**
   * Importer les favoris (pour restauration)
   * @param {string} jsonString - JSON string des favoris
   * @returns {Promise<Array>}
   */
  importFavorites: async (jsonString) => {
    try {
      const favorites = JSON.parse(jsonString);
      if (Array.isArray(favorites)) {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
        console.log(' Favoris importés:', favorites.length);
        return favorites;
      } else {
        throw new Error('Format JSON invalide');
      }
    } catch (error) {
      console.error(' Erreur import favoris:', error);
      throw error;
    }
  }
};

export default favoritesService;
